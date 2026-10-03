export async function main(ns: NS) {
  const hackLvl = ns.getHackingLevel();
  const hackMult = ns.getHackingMultipliers().speed;
  const marks: Map<string, Array<number>> = new Map();

  const search = (target: string) => {
    ns.scan(target).forEach((node) => {
      if (marks.has(node)) return;

      const monMax = ns.getServerMaxMoney(node);
      const secMin = ns.getServerMinSecurityLevel(node);
      const hackLvlNeeded = ns.getServerRequiredHackingLevel(node);
      const hackSpeed =
        5 * hackMult * ((2.5 * hackLvlNeeded * secMin + 500) / (hackLvl + 50));
      const weakenSpeed = 4 * hackSpeed;
      const rate = monMax / weakenSpeed;

      marks.set(node, [rate, hackLvlNeeded]);
      search(node);
    });
  };

  search("home");

  const marksSortedByRatio = new Map(
    [...marks].sort((a, b) => b[1][0] - a[1][0]),
  );
  const col1 = 15;
  const col2 = 11;
  const col3 = 5;
  const header = `|${"Name".padEnd(col1)} | ${"Rate".padStart(col2)} | ${"Level".padStart(col3)}|`;
  const divider = `+${"-".repeat(col1)}-+-${"-".repeat(col2)}-+-${"-".repeat(col3)}+`;

  // overall
  let top5 = [...marksSortedByRatio].slice(0, 5);
  let rows = top5.map(
    (row) =>
      `|${row[0].padEnd(col1)} | ${`$${ns.format.number(row[1][0], 1)} / s`.padStart(col2)} | ${String(row[1][1]).padStart(col3)}|`,
  );
  ns.tprint(
    `\n\nthe top 5 best marks overall:\n${divider}\n${header}\n${divider}\n${rows.join("\n")}\n${divider}`,
  );

  // hackable
  top5 = [...marksSortedByRatio]
    .filter((mark) => mark[1][1] <= hackLvl)
    .slice(0, 5);
  rows = top5.map(
    (row) =>
      `|${row[0].padEnd(col1)} | ${`$${ns.format.number(row[1][0], 1)} / s`.padStart(col2)} | ${String(row[1][1]).padStart(col3)}|`,
  );
  ns.tprint(
    `\n\nthe top 5 best marks hackable:\n${divider}\n${header}\n${divider}\n${rows.join("\n")}\n${divider}`,
  );

  // optimal
  top5 = [...marksSortedByRatio]
    .filter((mark) => mark[1][1] <= hackLvl / 2)
    .slice(0, 10);
  rows = top5.map(
    (row) =>
      `|${row[0].padEnd(col1)} | ${`$${ns.format.number(row[1][0], 1)} / s`.padStart(col2)} | ${String(row[1][1]).padStart(col3)}|`,
  );
  ns.tprint(
    `\n\nthe top optimal 5 best marks:\n${divider}\n${header}\n${divider}\n${rows.join("\n")}\n${divider}`,
  );
}
