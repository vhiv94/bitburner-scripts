import { GrowInfo, HackInfo, WeakenInfo } from "LogInfo";
import { Target } from "Target";
import { Host } from "Host";
import { NS } from "../NetscriptDefinitions";

export async function main(ns: NS) {
  // constants
  const target = new Target(ns, (ns.args[0] as string) || ns.getHostname());
  const host = new Host(ns, (ns.args[1] as string) || ns.getHostname());
  const flags = ns.flags([["s", false]]);
  const allowShotgun = flags.s as boolean;

  const port = ns.pid;
  ns.clearPort(port);

  // prep
  if (!target.hasRootAccess) {
    ns.exec("gain-root-access.js", host.name, 1, target.name);
    await ns.sleep(10);
  }
  const prepped = performance.now();

  // main loop
  while (true) {
    await shotgunMerged();
    // if (target.securityLevel > target.securityMin) await weaken();
    // else if (target.moneyAvailable < target.moneyMax * 0.95) await grow();
    // else await hack();
  }

  //  *end of execution*  //

  async function shotgunMerged() {
      const runTime = target.weakenTime;
      let execIndex = 0;

      // weaken prep
      if (target.securityLevel > target.securityMin) {
        const weakenThreads = target.getWeakenThreadCount(host.threadsAvailable);
        target.weaken(host.name, weakenThreads, 0);
        execIndex++;
      }
      // grow prep
      if (target.moneyAvailable < target.moneyMax * 0.95) {
        const [growThreads, weakenThreads] = target.getGrowThreadCounts(
          host.threadsAvailable,
          host.cores,
        );
        const [growDelay, weakenDelay] = target.growDelays;
        target.grow(host.name, growThreads, growDelay + execIndex * 5);
        target.weaken(host.name, weakenThreads, weakenDelay + execIndex * 5);
        execIndex++;
      }

      // batch hack
      const [
        hackThreads,
        weakenHThreads,
        growThreads,
        weakenGThreads,
        batchCount,
      ] = target.getHackThreadCounts(target.moneyMax, host.threadsAvailable, host.cores);
      const [hackDelay, weakenHDelay, growDelay, weakenGDelay, sleep] = target.hackDelays.map((val) => val + execIndex * 5);
      for (let i = 0; i < batchCount; i++) {
        target.hack(host.name, hackThreads, hackDelay + i * 20, port);
        target.weaken(host.name, weakenHThreads, weakenHDelay + i * 20);
        target.grow(host.name, growThreads, growDelay + i * 20);
        target.weaken(host.name, weakenGThreads, weakenGDelay + i * 20);
      }
      await ns.sleep(sleep + batchCount * 20);
  }

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
      targetName: target.name,
      decrement: securityPreWeaken - securityPostWeaken,
      moneyAvailable: target.moneyAvailable,
      moneyPercentage: target.moneyPercentage,
      securityLevel: target.securityLevel,
      securityOffset: target.securityOffset,
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
      targetName: target.name,
      increase: growth,
      percentage: growth / target.moneyMax,
      moneyAvailable: target.moneyAvailable,
      moneyPercentage: target.moneyPercentage,
      securityLevel: target.securityLevel,
      securityOffset: target.securityOffset,
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
    ] = target.getHackThreadCounts(target.moneyAvailable, host.threadsAvailable, host.cores);

    // calculate delays
    const [hackDelay, weakenHDelay, growDelay, weakenGDelay, sleep] =
      target.hackDelays;
    const runTime = sleep + initialDelay + batchCount * 20;

    // execute
    const batchIndex = allowShotgun ? batchCount : 0;
    for (let i = 0; i < batchIndex; i++) {
      target.hack(host.name, hackThreads, hackDelay + initialDelay + i * 20, port);
      target.weaken(host.name, weakenHThreads, weakenHDelay + initialDelay + i * 20);
      target.grow(host.name, growThreads, growDelay + initialDelay + i * 20);
      target.weaken(host.name, weakenGThreads, weakenGDelay + initialDelay + i * 20);
    }
    await ns.sleep(runTime);

    // log results
    const stolen: number = readPort(port);
    const hackInfo: HackInfo = {
      kind: "hack",
      targetName: target.name,
      stolen: stolen,
      rate: (stolen / runTime) * 1000,
      moneyAvailable: target.moneyAvailable,
      moneyPercentage: target.moneyPercentage,
      securityLevel: target.securityLevel,
      securityOffset: target.securityOffset,
    };
    ns.exec("logger.js", "msg-dump", 1, JSON.stringify(hackInfo));

    // update dashboard
  }
  
  function readPort(port: number): number {
    let res: number = 0;
    while (ns.peek(port) !== "NULL PORT DATA") {
      res += parseFloat(ns.readPort(port));
    }
    return res;
  }
}