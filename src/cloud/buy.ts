import { reset, white, cyan, green, ramOpts } from "../constants.ts";

export async function main(ns: NS) {
  const ramGB: string = (await ns.prompt(
    "How much ram you would like your new server to have?",
    {
      type: "select",
      choices: [...ramOpts.keys()],
    },
  )) as string;
  const ram = ramOpts.get(ramGB) as number;
  const cost = ns.cloud.getServerCost(ram);
  const name = (await ns.prompt(
    "What would you like to call this new server?",
    { type: "text" },
  )) as string;
  const confirmation = await ns.prompt(`\
\ \ ${ns.format.ram(ram)} costs $${ns.format.number(cost)}
\ \ Would you like to purchase ${name}?`);
  if (confirmation) {
    const server = ns.cloud.purchaseServer(name, ram);
    if (server)
      ns.tprint(
        `${white + server + reset} purchased for $${green + ns.format.number(cost) + reset} with ${cyan + ns.format.ram(ram) + reset} of ram.`,
      );
    else ns.tprint("Purchase denied. Check your current funds.");
  }
}
