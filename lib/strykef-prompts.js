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

/** Join allCandidates into one copyable prompt block. */
export function joinAllCandidates(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) return "";
  return candidates
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .join("\n\n");
}

let candidatesByClaimCode = null;

function loadIndex() {
  if (candidatesByClaimCode) return candidatesByClaimCode;

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

    const allCandidates = Array.isArray(item.allCandidates)
      ? item.allCandidates
          .map((c) => (typeof c === "string" ? c : String(c ?? "")))
          .filter((c) => c.trim())
      : [];

    // Only index claimCode → allCandidates. Never expose fbid / full record.
    map.set(key, allCandidates);
  }

  candidatesByClaimCode = map;
  return candidatesByClaimCode;
}

/**
 * @returns {string[] | null}
 */
export function lookupAllCandidatesByClaimCode(claimCode) {
  const key = normalizeClaimCode(claimCode);
  if (!key) return null;
  const index = loadIndex();
  if (!index.has(key)) return null;
  return index.get(key);
}
