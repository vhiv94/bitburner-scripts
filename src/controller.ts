import { GrowInfo, HackInfo, LogInfo, WeakenInfo } from "./LogInfo.ts";
import { Target } from "./Target.ts";
import { Host } from "./Host.ts";
import { GrowParams, HackParams, WeakenParams } from "./ExecParams.ts";

export async function main(ns: NS) {
  // constants
  const target = new Target(ns, (ns.args[0] as string) || ns.getHostname());
  const host = new Host(ns, (ns.args[1] as string) || ns.getHostname());
  const allowShotgun = host.name === "home";

  const weakenParamsBase: WeakenParams = {
    targetName: target.name,
    kind: "weaken",
  };
  const growParamsBase: GrowParams = { targetName: target.name, kind: "grow" };
  const hackParamsBase: HackParams = {
    targetName: target.name,
    kind: "hack",
    port: ns.pid,
  };
  ns.clearPort(ns.pid);

  // prep
  if (!target.hasRootAccess) {
    ns.exec("gain-root-access.ts", host.name, 1, target.name);
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
    ns.exec(
      "workers.ts",
      host.name,
      weakenThreads,
      JSON.stringify(weakenParamsBase),
    );
    await ns.sleep(target.weakenTime + 5);

    // log results
    const securityPostWeaken = target.securityLevel;
    const weakenInfo: WeakenInfo = {
      kind: "weaken",
      target: target,
      decrement: securityPreWeaken - securityPostWeaken,
    };
    ns.exec("logger.ts", "msg-dump", 1, JSON.stringify(weakenInfo));

    // update dashboard
  }

  async function grow() {
    // calculate threads
    const [growThreads, weakenThreads] = target.getGrowThreadCounts(
      host.threadsAvailable,
      host.cores,
    );

    // calculate delays
    const [growDelay, weakenDelay, sleep] = target.growDelays;

    // execute
    const growParams = JSON.stringify({ ...growParamsBase, delay: growDelay });
    const weakenParams = JSON.stringify({
      ...weakenParamsBase,
      delay: weakenDelay,
    });

    const moneyPreGrowth = target.moneyAvailable;
    ns.exec("workers.ts", host.name, growThreads, growParams);
    ns.exec("workers.ts", host.name, weakenThreads, weakenParams);
    await ns.sleep(sleep);

    // log result
    const growth = target.moneyAvailable - moneyPreGrowth;
    const growInfo: GrowInfo = {
      kind: "grow",
      target: target,
      increase: growth,
      percentage: growth / target.moneyMax,
    };
    ns.exec("logger.ts", "msg-dump", 1, JSON.stringify(growInfo));

    // update dashboard
  }

  async function hack() {
    // calculate threads
    const [
      hackThreads,
      weakenHThreads,
      growThreads,
      weakenGThreads,
      totalThreads,
    ] = target.getHackThreadCounts(host.threadsAvailable, host.cores);

    const batchIndex = allowShotgun
      ? Math.floor(host.threadsAvailable / totalThreads)
      : 0;

    // calculate delays
    const [hackDelay, weakenHDelay, growDelay, weakenGDelay, sleep] =
      target.hackDelays;

    // execute

    for (let i = 0; i <= batchIndex; i++) {
      const hackParams = JSON.stringify({
        ...hackParamsBase,
        delay: hackDelay + i * 20,
      });
      const weakenHParams = JSON.stringify({
        ...weakenParamsBase,
        delay: weakenHDelay + i * 20,
      });
      const growParams = JSON.stringify({
        ...growParamsBase,
        delay: growDelay + i * 20,
      });
      const weakenGParams = JSON.stringify({
        ...weakenParamsBase,
        delay: weakenGDelay + i * 20,
      });

      ns.exec("workers.ts", host.name, hackThreads, hackParams);
      ns.exec("workers.ts", host.name, weakenHThreads, weakenHParams);
      ns.exec("workers.ts", host.name, growThreads, growParams);
      ns.exec("workers.ts", host.name, weakenGThreads, weakenGParams);
    }
    await ns.sleep(sleep + batchIndex * 20);

    // log results
    const stolen: number = ns.readPort(ns.pid) ?? 0;
    const hackInfo: HackInfo = {
      kind: "hack",
      target: target,
      stolen: stolen,
      rate: (stolen / sleep) * 1000,
    };
    ns.exec("logger.ts", "msg-dump", 1, JSON.stringify(hackInfo));

    // update dashboard
  }
}
