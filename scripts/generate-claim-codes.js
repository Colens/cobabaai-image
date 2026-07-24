/**
 * Add / regenerate claimCode for each record in the Strykef export JSON.
 * Usage: node scripts/generate-claim-codes.js
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_FILE = path.join(
  __dirname,
  "..",
  "data",
  "strykef-export-partial-1000.json",
);
const MAP_FILE = path.join(__dirname, "..", "data", "claim-codes-map.json");

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeClaimCode() {
  const bytes = crypto.randomBytes(10);
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `${code.slice(0, 5)}-${code.slice(5)}`;
}

function main() {
  const list = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  if (!Array.isArray(list)) {
    throw new Error("Data file must be an array");
  }

  const used = new Set();
  for (const item of list) {
    let code;
    do {
      code = makeClaimCode();
    } while (used.has(code));
    used.add(code);
    item.claimCode = code;
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
  fs.writeFileSync(
    MAP_FILE,
    JSON.stringify(
      list.map((item) => ({
        index: item.index,
        claimCode: item.claimCode,
        fbid: item.fbid,
      })),
      null,
      2,
    ),
  );

  console.log(`Generated ${used.size} claim codes → ${DATA_FILE}`);
  console.log(`Admin map (no prompts) → ${MAP_FILE}`);
}

main();
