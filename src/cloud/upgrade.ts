import { reset, white, green, cyan, ramOpts } from "../constants.ts";

export async function main(ns: NS) {
  const serverList: string[] = ns.cloud.getServerNames();
  const name = (await ns.prompt(
    "Which cloud server would you like to upgrade?",
    {
      type: "select",
      choices: serverList,
    },
  )) as string;
  const ramAvail = ns.getServerMaxRam(name);
  const ramOptsAvail = new Map([...ramOpts].filter((e) => e[1] > ramAvail));
  const ramGB = (await ns.prompt(
    `How much ram would you like ${name} to now have?`,
    {
      type: "select",
      choices: [...ramOptsAvail.keys()],
    },
  )) as string;
  const ram = ramOptsAvail.get(ramGB) as number;
  const cost = ns.cloud.getServerUpgradeCost(name, ram) as number;
  const confirmation = await ns.prompt(`\
\ \ Upgrading to ${ns.format.ram(ram)} will cost $${ns.format.number(cost)}.\
\ \ Would you still like to upgrade ${name}?`);
  if (confirmation) {
    const isUpgraded = ns.cloud.upgradeServer(name, ram);
    if (isUpgraded)
      ns.tprint(
        `${white + name + reset}'s ram was upgraded to ${cyan + ns.format.ram(ram) + reset} for $${green + ns.format.number(cost) + reset}.`,
      );
    else ns.tprint("Upgrade denied. Check your current funds.");
  }
}
