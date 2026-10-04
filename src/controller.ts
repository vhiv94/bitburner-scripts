import { GrowInfo, HackInfo, LogInfo, WeakenInfo } from "./LogInfo.js";
import { Target } from "./Target.js";
import { Host } from "./Host.js";
import { ExecParams } from "./ExecParams.js";

export async function main(ns: NS) {
  // constants
  const target = new Target(ns, (ns.args[0] as string) || ns.getHostname());
  const host = new Host(ns, (ns.args[1] as string) || ns.getHostname());
  const allowShotgun = host.name === "home";

  const port = ns.pid;
  ns.clearPort(port);

  // prep
  if (!target.hasRootAccess) {
    ns.exec("gain-root-access.js", host.name, 1, target.name);
    await ns.sleep(10);
  }
  while (target.securityLevel > target.securityMin) await weaken();
  while (target.moneyAvailable < target.moneyMax) await grow();
  const prepped = performance.now();

  // main loop
  while (true) {
    if (target.securityLevel > target.securityMin) await weaken();
    else if (target.moneyAvailable < target.moneyMax * 0.95) await grow();
    else await hack();
  }

  //  *end of execution*  //

  async function weaken() {
    // calculate threads
    const weakenThreads = target.getWeakenThreadCount(host.threadsAvailable);

    // execute
    const securityPreWeaken = target.securityLevel;
    target.weaken(host.name, weakenThreads, 0);
    if (target.moneyAvailable < target.moneyMax * 0.95) await grow(5);
    else if (host.threadsAvailable > 10) await hack(5);
    else await ns.sleep(target.weakenTime + 5);

    // log results
    const securityPostWeaken = target.securityLevel;
    const weakenInfo: WeakenInfo = {
      kind: "weaken",
      target: target,
      decrement: securityPreWeaken - securityPostWeaken,
    };
    ns.exec("logger.js", "msg-dump", 1, JSON.stringify(weakenInfo));

    // update dashboard
  }

  async function grow(initialDelay: number = 0) {
    // calculate threads
    const [growThreads, weakenThreads] = target.getGrowThreadCounts(
      host.threadsAvailable,
      host.cores,
    );

    // calculate delays
    const [growDelay, weakenDelay, sleep] = target.growDelays.map((val) => val + initialDelay);

    // execute
    const moneyPreGrowth = target.moneyAvailable;
    target.grow(host.name, growThreads, growDelay);
    target.weaken(host.name, weakenThreads, weakenDelay);
    if (host.threadsAvailable > 10) await hack(10);
    else await ns.sleep(sleep);

    // log result
    const growth = target.moneyAvailable - moneyPreGrowth;
    const growInfo: GrowInfo = {
      kind: "grow",
      target: target,
      increase: growth,
      percentage: growth / target.moneyMax,
    };
    ns.exec("logger.js", "msg-dump", 1, JSON.stringify(growInfo));

    // update dashboard
  }

  async function hack(initialDelay: number = 0) {
    // calculate threads
    const [
      hackThreads,
      weakenHThreads,
      growThreads,
      weakenGThreads,
      batchCount,
    ] = target.getHackThreadCounts(host.threadsAvailable, host.cores);

    // calculate delays
    const [hackDelay, weakenHDelay, growDelay, weakenGDelay, sleep] =
      target.hackDelays;

    // execute

    for (let i = 0; i < batchCount; i++) {
      target.hack(host.name, hackThreads, hackDelay + initialDelay + i * 20, port);
      target.weaken(host.name, weakenHThreads, weakenHDelay + initialDelay + i * 20);
      target.grow(host.name, growThreads, growDelay + initialDelay + i * 20);
      target.weaken(host.name, weakenGThreads, weakenGDelay + initialDelay + i * 20);
    }
    await ns.sleep(sleep + batchCount * 20);

    // log results
    const stolen: number = ns.readPort(ns.pid) ?? 0;
    const hackInfo: HackInfo = {
      kind: "hack",
      target: target,
      stolen: stolen,
      rate: (stolen / sleep) * 1000,
    };
    ns.exec("logger.js", "msg-dump", 1, JSON.stringify(hackInfo));

    // update dashboard
  }
}
