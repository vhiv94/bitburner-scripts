export async function main(ns: NS) {
  const server = ns.args[0] as string;
  const isCopied = ns.scp(
    [
      "controller.js",
      "Target.js",
      "Host.js",
      "gain-root-access.js",
      "workers/weaken.js",
      "workers/grow.js",
      "workers/hack.js",
    ],
    server,
    "home",
  );
  if (!isCopied) ns.tprint("Migration failed!");
}
