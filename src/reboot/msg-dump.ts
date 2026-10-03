export async function main(ns: NS) {
  const isCopied = ns.scp(
    [
      "logs/msg-dump.ts",
      "logs/log-weaken.ts",
      "logs/log-grow.ts",
      "logs/log-hack.ts",
      "constants.ts",
    ],
    "msg-dump",
    "home",
  );
  if (!isCopied) ns.tprint("Migration failed!");
  const pid = ns.exec("logs/msg-dump.ts", "msg-dump", {
    preventDuplicates: true,
  });
  ns.ui.openTail(pid, "msg-dump");
  ns.ui.setTailTitle("Message Dump", pid);
  ns.ui.resizeTail(500, 100, pid);
  ns.ui.moveTail(1960, 0, pid);
}
