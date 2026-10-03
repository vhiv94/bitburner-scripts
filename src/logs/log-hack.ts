import { reset, red, cyan, green, yellow, white, line } from "../constants.ts";

export async function main(ns: NS) {
  let hackInfo = JSON.parse(ns.args[0] as string);
  let server = white + hackInfo.target + ":" + reset;
  let stolen = green + "$" + ns.format.number(hackInfo.stolenAmount) + reset;
  let rate = green + "$" + ns.format.number(hackInfo.stolenRate) + reset + "/s";
  let available =
    green + "$" + ns.format.number(hackInfo.moneyAvailable) + reset;
  let percentage = cyan + ns.format.percent(hackInfo.moneyPercentage) + reset;
  let security = yellow + ns.format.number(hackInfo.securityLevel) + reset;
  let offset: string;
  if (hackInfo.securityOffset == 0) offset = "";
  else
    offset =
      " | " +
      (hackInfo.securityOffset >= 1 ? red : yellow) +
      "+" +
      ns.format.number(hackInfo.securityOffset) +
      reset;

  ns.writePort(
    10,
    `${server} amount stolen: ${stolen} | ${rate}\
    \n${server} money available: ${available} | ${percentage}\
    \n${server} security level: ${security + offset}\
    \n${line}`,
  );
}
