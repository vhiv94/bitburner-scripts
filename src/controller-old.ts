export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const hosted = ns.args[1] ?? true;
  const host = hosted ? ns.getHostname() : target;
  const monMax: number = ns.getServerMaxMoney(target);
  const secMin: number = ns.getServerMinSecurityLevel(target);

  const hackPort: number = ns.pid + 69;
  ns.clearPort(hackPort);

  const ramMax = () => ns.getServerMaxRam(host);
  const ramAvail = () => ramMax() - ns.getServerUsedRam(host);
  const threadsAvail = () => Math.floor(ramAvail() / 1.75);
  const secLvl = () => ns.getServerSecurityLevel(target);
  const monAvail = () => ns.getServerMoneyAvailable(target);

  if (!ns.hasRootAccess(target)) {
    ns.exec("gain-root-access.ts", host, 1, target);
    await ns.sleep(10);
  }

  // main loop
  while (true) {
    if (secLvl() > secMin) await weaken();
    else if (monAvail() < monMax * 0.95) await grow();
    else await hack();
  }

  async function weaken() {
    const difference = secLvl() - secMin;
    const weakenThreads = Math.ceil(difference / 0.05);
    const securityPreWeaken = secLvl();

    ns.exec(
      "workers/weaken.ts",
      host,
      threadsAvail() > weakenThreads ? weakenThreads : threadsAvail(),
      target,
    );

    await ns.sleep(ns.getWeakenTime(target) + 5);

    const decrement = securityPreWeaken - secLvl();
    const weakenInfo = {
      target: target,
      decrement: decrement,
      securityLevel: secLvl(),
      securityIncrement: secLvl() - secMin,
    };

    ns.exec("logs/log-weaken.ts", "msg-dump", 1, JSON.stringify(weakenInfo));
  }

  async function grow() {
    //calculations
    const prepThreadsAvail = Math.floor(threadsAvail());
    let calculating = true;
    let growThreads, weakenThreads;
    for (let i = prepThreadsAvail - 1; calculating; i--) {
      growThreads = i;
      weakenThreads = Math.ceil(growThreads * 0.08);
      if (growThreads + weakenThreads <= prepThreadsAvail) calculating = false;
    }

    const weakenRunTime = ns.getWeakenTime(target);
    const growthRunTime = ns.getGrowTime(target);
    const growthDelay = weakenRunTime - growthRunTime;
    const monPreGrow = monAvail();

    ns.exec("workers/grow.ts", host, growThreads, target, growthDelay);
    ns.exec("workers/weaken.ts", host, weakenThreads, target, 5);

    await ns.sleep(weakenRunTime + 10);

    let growth = monAvail() - monPreGrow;
    const growInfo = {
      target: target,
      growthAmount: growth,
      growthPercentage: growth / monMax,
      moneyAvailable: monAvail(),
      moneyPercentage: monAvail() / monMax,
      securityLevel: secLvl(),
      securityIncrement: secLvl() - secMin,
    };

    ns.exec("logs/log-grow.ts", "msg-dump", 1, JSON.stringify(growInfo));
  }

  // hack loop
  async function hack() {
    const hackThreadsAvail = Math.floor(threadsAvail());
    let calculating = true;
    let hackThreads, weakenHThreads, growThreads, weakenGThreads;
    for (let i = 1; calculating; i++) {
      let hackT = i;
      let weakHT = Math.ceil(hackT * 0.04);
      let stolen = hackT * ns.hackAnalyze(target);
      if (stolen >= 0.99) break;
      let growT = Math.ceil(ns.growthAnalyze(target, 1 / (1 - stolen)));
      let weakGT = Math.ceil(growT * 0.08);
      let theoreticalT = hackT + weakHT + growT + weakGT;
      if (theoreticalT > hackThreadsAvail) calculating = false;
      else {
        hackThreads = hackT;
        weakenHThreads = weakHT;
        growThreads = growT;
        weakenGThreads = weakGT;
      }
    }

    let weakenRunTime = ns.getWeakenTime(target);
    let hackDelay = weakenRunTime - ns.getHackTime(target);
    let growthDelay = weakenRunTime - ns.getGrowTime(target) + 10;

    ns.run("workers/hack.ts", hackThreads, target, hackDelay, hackPort);
    ns.run("workers/weaken.ts", weakenHThreads, target, 5);
    ns.run("workers/grow.ts", growThreads, target, growthDelay);
    ns.run("workers/weaken.ts", weakenGThreads, target, 15);

    await ns.sleep(weakenRunTime + 20);

    const stolen: number = ns.readPort(hackPort) ?? 0;
    const hackInfo = {
      target: target,
      stolenAmount: stolen,
      stolenRate: (stolen / weakenRunTime) * 1000,
      moneyAvailable: monAvail(),
      moneyPercentage: monAvail() / monMax,
      securityLevel: secLvl(),
      securityIncrement: secLvl() - secMin,
    };

    ns.exec("logs/log-hack.ts", "msg-dump", 1, JSON.stringify(hackInfo));
  }
}
