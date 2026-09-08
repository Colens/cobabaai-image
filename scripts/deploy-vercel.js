/**
 * Deploy current project to Vercel production (non-interactive).
 *
 * Usage:
 *   npm run deploy
 *   node scripts/deploy-vercel.js
 *
 * Requires: logged-in Vercel CLI (`npx vercel login`) or VERCEL_TOKEN.
 * Uses `.vercelignore` so `data/*.json` is uploaded even if gitignored.
 */
const { spawn } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      shell: true,
      env: process.env,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

async function main() {
  console.log("→ Deploying to Vercel production…");
  await run("npx", ["vercel", "--prod", "--yes"]);
  console.log("✓ Production deploy finished.");
}

main().catch((error) => {
  console.error("✗ Deploy failed:", error.message || error);
  process.exit(1);
});
