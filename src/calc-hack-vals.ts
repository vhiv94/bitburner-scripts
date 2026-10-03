import { magenta, white, reset } from "./constants.ts";

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const host = (ns.args[1] as string) ?? target;
  const threadsAvail = Math.floor(
    (ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / 1.75,
  );

  let calculating = true;
  for (let i = 1; calculating; i++) {
    let hackT = i;
    let weakHT = Math.ceil(hackT * 0.04);
    let stolen = hackT * ns.hackAnalyze(target);
    let growT = Math.ceil(ns.growthAnalyze(target, 1 / (1 - stolen)));
    let weakGT = Math.ceil(growT * 0.08);
    let theoreticalT = hackT + weakHT + growT + weakGT;
    if (theoreticalT > threadsAvail) {
      calculating = false;
      const server = `${white + target + reset}`;
      ns.writePort(
        10,
        ` \
        \n${server}: current hack thread count:${magenta + hackT + reset} \
        \n${server}: current weakenH thread count:${magenta + weakHT + reset} \
        \n${server}: current grow thread count:${magenta + growT + reset} \
        \n${server}: current weakenG thread count:${magenta + weakGT + reset}`,
      );
    }
  }
}
