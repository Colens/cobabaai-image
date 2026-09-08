import { MODEL_OPTIONS } from "@/components/views/index/model-config";

/** Fallback prices (¥ / request) from CobabaAi docs — used if /api/pricing fails */
export const FALLBACK_MODEL_PRICES_CNY = {
  "gpt-image-2": 0.066,
  "gpt-image-2-vip": 0.22,
  "nano-banana-fast": 0.048,
  "nano-banana": 0.066,
  "nano-banana-pro": 0.198,
  "nano-banana-pro-preview": 0.36,
  "nano-banana-pro-vt": 0.198,
  "nano-banana-pro-cl": 1.1,
  "nano-banana-pro-vip": 1.1,
  "nano-banana-pro-4k-vip": 1.98,
  "nano-banana-2": 0.132,
  "nano-banana-2-cl": 0.66,
  "nano-banana-2-4k-cl": 1.43,
};

const DEFAULT_USD_CNY = 7.3;

/** Match CobabaAi console/docs: ¥0.066 / 次 */
export function formatPriceLine(cny) {
  if (cny == null || !Number.isFinite(Number(cny))) return "—";
  const amount = Number(cny);
  return `¥${amount.toFixed(3)} / 次`;
}

export function shouldExcludeModel(name) {
  const n = String(name || "").toLowerCase().trim();
  if (!n) return true;
  if (n.includes("veo") || n.includes("sora")) return true;
  if (n === "nano-banana") return true;
  return false;
}

export function getDefaultModelList() {
  return MODEL_OPTIONS.filter((name) => !shouldExcludeModel(name)).map(
    (model_name) => ({
      model_name,
      price_cny: FALLBACK_MODEL_PRICES_CNY[model_name] ?? null,
      price_line: formatPriceLine(FALLBACK_MODEL_PRICES_CNY[model_name]),
    }),
  );
}

/**
 * CobabaAi /api/pricing: data[] with quota_type=1 model_price in USD.
 * Convert to CNY for display (same as console /docs pricing).
 */
export function parsePricingApiPayload(payload) {
  const models = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.models)
      ? payload.models
      : Array.isArray(payload)
        ? payload
        : null;

  if (!models?.length) return null;

  const rate =
    Number(payload?.usd_exchange_rate) > 0
      ? Number(payload.usd_exchange_rate)
      : DEFAULT_USD_CNY;

  const byName = new Map();
  for (const m of models) {
    const model_name = m.model_name || m.modelName || m.name || m.model;
    if (!model_name || shouldExcludeModel(model_name)) continue;
    if (!MODEL_OPTIONS.includes(model_name)) continue;
    if (m.quota_type != null && Number(m.quota_type) !== 1) continue;

    let priceUsd = Number(m.model_price);
    if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
      priceUsd = Number(m.price);
    }
    if (!Number.isFinite(priceUsd) || priceUsd <= 0) continue;

    const price_cny = priceUsd * rate;
    byName.set(model_name, {
      model_name,
      price_cny,
      price_line: formatPriceLine(price_cny),
    });
  }

  if (byName.size === 0) return null;

  return MODEL_OPTIONS.filter((n) => !shouldExcludeModel(n)).map((n) => {
    if (byName.has(n)) return byName.get(n);
    return {
      model_name: n,
      price_cny: FALLBACK_MODEL_PRICES_CNY[n] ?? null,
      price_line: formatPriceLine(FALLBACK_MODEL_PRICES_CNY[n]),
    };
  });
}
