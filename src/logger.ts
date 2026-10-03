import { reset, red, cyan, green, yellow, white, line } from "./constants.ts";
import { GrowInfo, HackInfo, WeakenInfo, LogInfo } from "./LogInfo.ts";

export async function main(ns: NS) {
  let info: LogInfo = JSON.parse(ns.args[0] as string);
  switch (info.kind) {
    case "weaken":
      logWeaken(ns, info);
      break;
    case "grow":
      LogGrow(ns, info);
      break;
    case "hack":
      LogHack(ns, info);
      break;
    default:
      const _exhaustiveCheck: never = info;
      return _exhaustiveCheck;
  }
}

function logWeaken(ns: NS, info: WeakenInfo) {
  let server = white + info.target.name + ":" + reset;
  let decrement = cyan + "-" + ns.format.number(info.decrement) + reset;
  let security = yellow + ns.format.number(info.target.securityLevel) + reset;
  let offset: string;
  if (info.target.securityOffset == 0) offset = "";
  else
    offset =
      " | " +
      (info.target.securityOffset >= 1 ? red : yellow) +
      "+" +
      ns.format.number(info.target.securityOffset) +
      reset;

  ns.writePort(
    10,
    `${server} preparatory weakening: ${decrement}\
    \n${server} security level: ${security + offset}\
    \n${line}`,
  );
}

function LogGrow(ns: NS, info: GrowInfo) {
  let server = white + info.target.name + ":" + reset;
  let growth = green + "$" + ns.format.number(info.increase) + reset;
  let increase = cyan + "+" + ns.format.percent(info.percentage) + reset;
  let available =
    green + "$" + ns.format.number(info.target.moneyAvailable) + reset;
  let percentage =
    cyan + ns.format.percent(info.target.moneyPercentage) + reset;
  let security = yellow + ns.format.number(info.target.securityLevel) + reset;
  let offset: string;
  if (info.target.securityOffset == 0) offset = "";
  else
    offset =
      " | " +
      (info.target.securityOffset >= 1 ? red : yellow) +
      "+" +
      ns.format.number(info.target.securityOffset) +
      reset;

  ns.writePort(
    10,
    `${server} preparatory growth: ${growth} | ${increase}\
    \n${server} money available: ${available} | ${percentage}\
    \n${server} security level: ${security + offset}\
    \n${line}`,
  );
}

function LogHack(ns: NS, info: HackInfo) {
  let server = white + info.target.name + ":" + reset;
  let stolen = green + "$" + ns.format.number(info.stolen) + reset;
  let rate = green + "$" + ns.format.number(info.rate) + reset + "/s";
  let available =
    green + "$" + ns.format.number(info.target.moneyAvailable) + reset;
  let percentage =
    cyan + ns.format.percent(info.target.moneyPercentage) + reset;
  let security =
    yellow + ns.format.number(info.target.securityLevel || 0) + reset;
  let offset: string;
  if (info.target.securityOffset == 0) offset = "";
  else
    offset =
      " | " +
      (info.target.securityOffset >= 1 ? red : yellow) +
      "+" +
      ns.format.number(info.target.securityOffset) +
      reset;

  ns.writePort(
    10,
    `${server} amount stolen: ${stolen} | ${rate}\
    \n${server} money available: ${available} | ${percentage}\
    \n${server} security level: ${security + offset}\
    \n${line}`,
  );
}
