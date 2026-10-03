export async function main(ns: NS) {
  ns.clearPort(10);
  while (true) {
    await ns.nextPortWrite(10);
    ns.print(ns.readPort(10));
  }
}