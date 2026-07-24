import ModelsPage from "@/components/site/pricing/ModelsPage";
import {
  getDefaultModelList,
  parsePricingApiPayload,
} from "@/components/site/pricing/modelPrices";

async function loadModels() {
  try {
    const res = await fetch("https://cobabaai.com/api/pricing", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return getDefaultModelList();
    const json = await res.json();
    return parsePricingApiPayload(json) || getDefaultModelList();
  } catch {
    return getDefaultModelList();
  }
}

export default async function ModelsRoutePage() {
  const models = await loadModels();
  return <ModelsPage initialModels={models} />;
}
