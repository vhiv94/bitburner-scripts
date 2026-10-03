import { reset, red, cyan, green, yellow, white, line } from "../constants.ts";

export async function main(ns: NS) {
  let weakenInfo = JSON.parse(ns.args[0] as string);
  let server = white + weakenInfo.target + ":" + reset;
  let decrement = cyan + "-" + ns.format.number(weakenInfo.decrement) + reset;
  let security = yellow + ns.format.number(weakenInfo.securityLevel) + reset;
  let offset: string;
  if (weakenInfo.securityOffset == 0) offset = "";
  else
    offset =
      " | " +
      (weakenInfo.securityOffset >= 1 ? red : yellow) +
      "+" +
      ns.format.number(weakenInfo.securityOffset) +
      reset;

  ns.writePort(
    10,
    `${server} preparatory weakening: ${decrement}\
    \n${server} security level: ${security + offset}\
    \n${line}`,
  );
}
