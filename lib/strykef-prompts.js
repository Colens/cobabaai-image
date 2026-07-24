import fs from "fs";
import path from "path";

const DATA_FILE =
  process.env.STRYKEF_DATA_PATH ||
  path.join(process.cwd(), "data", "strykef-export-partial-1000.json");

/** Normalize user input: RWDUK-JWKD4 / rwduk jwkd4 → RWDUKJWKD4 */
export function normalizeClaimCode(code) {
  return String(code ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

let promptByClaimCode = null;

function loadIndex() {
  if (promptByClaimCode) return promptByClaimCode;

  if (!fs.existsSync(DATA_FILE)) {
    throw new Error("Prompt data file is not available on the server");
  }

  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const list = JSON.parse(raw);
  if (!Array.isArray(list)) {
    throw new Error("Prompt data file format is invalid");
  }

  const map = new Map();
  for (const item of list) {
    const key = normalizeClaimCode(item?.claimCode);
    if (!key) continue;
    // Only index claimCode → prompt. Never expose fbid / allCandidates via API.
    map.set(key, typeof item.prompt === "string" ? item.prompt : "");
  }

  promptByClaimCode = map;
  return promptByClaimCode;
}

export function lookupPromptByClaimCode(claimCode) {
  const key = normalizeClaimCode(claimCode);
  if (!key) return null;
  const index = loadIndex();
  if (!index.has(key)) return null;
  return index.get(key);
}
