/**
 * Strip Facebook post chrome like:
 *   "Firman Corleones · 2h · Author Create a portrait..."
 *   "... · 4w · by Author Reply ..."
 * from prompt + allCandidates.
 *
 * Usage: node scripts/strip-author-prefix.js
 */
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(
  __dirname,
  "..",
  "data",
  "strykef-export-partial-1000.json",
);

// Leading: "Name · 2h · Author " / "Name · 6w · by Author "
const AUTHOR_PREFIX =
  /^[\s\S]*?·\s*\d+\s*[hdwmy]\s*·\s*(?:by\s+)?Author\s+/i;

// Anywhere: Facebook reply chrome "Name · 1w · by Author "
const AUTHOR_INLINE =
  /[A-Za-zÀ-ÿ][\w\s.'’-]{0,48}·\s*\d+\s*[hdwmy]\s*·\s*(?:by\s+)?Author\b\s*/gi;

function cleanPrompt(text) {
  if (typeof text !== "string" || !text) return text;
  let s = text;
  // Apply leading strip repeatedly in case of stacked chrome
  for (let i = 0; i < 5; i++) {
    if (!AUTHOR_PREFIX.test(s)) break;
    s = s.replace(AUTHOR_PREFIX, "");
  }
  s = s.replace(AUTHOR_INLINE, "");
  return s.replace(/[ \t]{2,}/g, " ").trim();
}

function main() {
  const list = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  if (!Array.isArray(list)) {
    throw new Error("Data file must be an array");
  }

  let promptHits = 0;
  let candHits = 0;

  for (const item of list) {
    const before = item.prompt;
    item.prompt = cleanPrompt(item.prompt);
    if (item.prompt !== before) promptHits += 1;

    if (Array.isArray(item.allCandidates)) {
      item.allCandidates = item.allCandidates.map((c) => {
        const next = cleanPrompt(c);
        if (next !== c) candHits += 1;
        return next;
      });
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));

  const remainAny = list.filter((item) =>
    /\bAuthor\b/i.test(item.prompt || ""),
  );
  const firman = list.filter((item) =>
    /^Firman/i.test(item.prompt || ""),
  ).length;

  console.log({
    promptHits,
    candHits,
    remainAuthorAnywhere: remainAny.length,
    stillStartsWithFirman: firman,
    sample0: list[0].prompt.slice(0, 100),
  });

  for (const item of remainAny.slice(0, 8)) {
    const m = item.prompt.match(/.{0,50}Author.{0,50}/i);
    console.log(item.index, m?.[0]);
  }
}

main();
