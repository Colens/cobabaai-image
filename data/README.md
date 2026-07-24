# Private server-side datasets (not served as static files).

- `strykef-export-partial-1000.json` — full records + `claimCode` + `prompt` (server only)
- `claim-codes-map.json` — admin distribution map (`index` / `claimCode` / `fbid`, no prompts)

Lookup happens only via `POST /api/prompt-claim` with `{ claimCode }`.

Regenerate codes:

```bash
node scripts/generate-claim-codes.js
```
