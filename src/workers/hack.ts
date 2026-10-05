import { ExecParams } from "../ExecParams";
import { NS } from "../../NetscriptDefinitions";

export async function main(ns: NS) {
  const params = JSON.parse(ns.args[0] as string) as ExecParams;
  const res = await ns.hack(params.targetName, { additionalMsec: params.delay });
  if (params.port) ns.writePort(params.port, res);
}
