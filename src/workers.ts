import { ExecParams } from "./ExecParams";

export async function main(ns: NS) {
  const params: ExecParams = JSON.parse(ns.args[0] as string);
  switch (params.kind) {
    case "weaken":
      await ns.weaken(params.targetName, { additionalMsec: params.delay });
      break;
    case "grow":
      await ns.grow(params.targetName, { additionalMsec: params.delay });
      break;
    case "hack":
      const res = await ns.hack(params.targetName, {
        additionalMsec: params.delay,
      });
      ns.writePort(params.port, res);
      break;
    default:
      const _exhaust: never = params;
      return _exhaust;
  }
}
