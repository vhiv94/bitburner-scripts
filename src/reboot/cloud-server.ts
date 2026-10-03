export async function main(ns: NS) {
  const server = ns.args[0] as string;
  const isCopied = ns.scp(
    [
      "hack-manager-main.ts",
      "workers/gain-root-access.ts",
      "workers/weaken.ts",
      "workers/grow.ts",
      "workers/hack.ts",
    ],
    server,
    "home",
  );
  if (!isCopied) ns.tprint("Migration failed!");
}
