import { reset, red, cyan, green, yellow, white, line } from "../constants.ts";

export async function main(ns: NS) {
  let growInfo = JSON.parse(ns.args[0] as string);
  let server = white + growInfo.target + ":" + reset;
  let growth = green + "$" + ns.format.number(growInfo.growthAmount) + reset;
  let increase =
    cyan + "+" + ns.format.percent(growInfo.growthPercentage) + reset;
  let available =
    green + "$" + ns.format.number(growInfo.moneyAvailable) + reset;
  let percentage = cyan + ns.format.percent(growInfo.moneyPercentage) + reset;
  let security = yellow + ns.format.number(growInfo.securityLevel) + reset;
  let offset: string;
  if (growInfo.securityOffset == 0) offset = "";
  else
    offset =
      " | " +
      (growInfo.securityOffset >= 1 ? red : yellow) +
      "+" +
      ns.format.number(growInfo.securityOffset) +
      reset;

  ns.writePort(
    10,
    `${server} preparatory growth: ${growth} | ${increase}\
    \n${server} money available: ${available} | ${percentage}\
    \n${server} security level: ${security + offset}\
    \n${line}`,
  );
}
