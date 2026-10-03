export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const portsNeeded = ns.getServerNumPortsRequired(target);

  if (portsNeeded > 0 && ns.fileExists("BruteSSH.exe", "home"))
    ns.brutessh(target);
  if (portsNeeded > 1 && ns.fileExists("FTPCrack.exe", "home"))
    ns.ftpcrack(target);
  if (portsNeeded > 2 && ns.fileExists("relaySMTP.exe", "home"))
    ns.relaysmtp(target);
  if (portsNeeded > 3 && ns.fileExists("HTTPWorm.exe", "home"))
    ns.httpworm(target);
  if (portsNeeded > 4 && ns.fileExists("SQLInject.exe", "home"))
    ns.sqlinject(target);

  ns.nuke(target);
}
