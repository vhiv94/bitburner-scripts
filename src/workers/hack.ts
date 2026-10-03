export async function main(ns: NS) {
  const target = (ns.args[0] as string) ?? null;
  const delay = (ns.args[1] as number) ?? 0;
  const port = (ns.args[2] as number) ?? 1;
  const res = await ns.hack(target, { additionalMsec: delay });
  ns.writePort(port, res);
}
