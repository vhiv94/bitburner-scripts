import { reset, white, green, cyan, ramOpts } from "../constants.ts";

export async function main(ns: NS) {
  const serverList: string[] = ns.cloud.getServerNames();
  const name = (await ns.prompt(
    "Which cloud server would you like to rename?",
    {
      type: "select",
      choices: serverList,
    },
  )) as string;
  const newName = (await ns.prompt("What would you like the new name to be?", {
    type: "text",
  })) as string;
  const confirmation = await ns.prompt(`Change ${name}'s name to ${newName}?`);
  if (confirmation) ns.cloud.renameServer(name, newName);
}
