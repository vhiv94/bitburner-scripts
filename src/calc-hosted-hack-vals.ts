export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const ramMax = () => ns.getServerMaxRam();
  const ramAvail = () => ramMax() - ns.getServerUsedRam();
  const threadsAvail = (ramCost: number) => ramAvail() / ramCost;
  const hackThreadsAvail = Math.floor(threadsAvail(1.75));
  let calculating = true;
  let hackThreads, weakenHThreads, growThreads, weakenGThreads;
  for (let i = 1; calculating; i++) {
    let hackT = i;
    let weakHT = Math.ceil(hackT * 0.04);
    let stolen = hackT * ns.hackAnalyze(target);
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
  ns.tprint(`hack: ${hackThreads}\
    \nweakenH: ${weakenHThreads}\
    \ngrow: ${growThreads}\
    \nweakenG: ${weakenGThreads}`);
}
