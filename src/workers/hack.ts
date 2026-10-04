export async function main(ns: NS) {
  const params = JSON.parse(ns.args[0] as string) as ExecParams;
  const res = await ns.hack(params.targetName, { additionalMsec: params.delay });
  ns.writePort(params.port, res);
}
