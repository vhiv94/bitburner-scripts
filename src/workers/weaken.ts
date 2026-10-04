export async function main(ns: NS) {
  const params = JSON.parse(ns.args[0] as string) as ExecParams;
  await ns.weaken(params.targetName, { additionalMsec: params.delay });
}
