/**
 * Print claimCodes for an index range.
 *
 * Usage:
 *   node scripts/print-claim-codes.js 994-1000
 *   node scripts/print-claim-codes.js 994 1000
 *   node scripts/print-claim-codes.js 50
 */
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(
  __dirname,
  "..",
  "data",
  "strykef-export-partial-1000.json",
);

function parseRange(args) {
  if (!args.length) {
    throw new Error("请输入范围，例如：994-1000 或 994 1000");
  }

  if (args.length === 1 && args[0].includes("-")) {
    const [a, b] = args[0].split("-").map((s) => s.trim());
    return [Number(a), Number(b)];
  }

  if (args.length === 1) {
    const n = Number(args[0]);
    return [n, n];
  }

  return [Number(args[0]), Number(args[1])];
}

function main() {
  const [start, end] = parseRange(process.argv.slice(2));
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    throw new Error("范围必须是整数，例如：994-1000");
  }
  if (start > end) {
    throw new Error(`起始 index (${start}) 不能大于结束 index (${end})`);
  }

  const list = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  const byIndex = new Map(
    list.map((item) => [Number(item.index), item.claimCode]),
  );

  let n = 0;
  const missing = [];
  for (let index = start; index <= end; index++) {
    n += 1;
    const claimCode = byIndex.get(index);
    if (!claimCode) {
      missing.push(index);
      console.log(`图${n}:（未找到 index=${index}）`);
      continue;
    }
    console.log(`图${n}:${claimCode}`);
  }

  if (missing.length) {
    console.error(`\n警告：缺少 index：${missing.join(", ")}`);
    process.exitCode = 1;
  }
}

main();
