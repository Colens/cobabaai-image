const NANO_ASPECT_RATIOS = [
  "auto",
  "1:1",
  "3:4",
  "4:3",
  "9:16",
  "16:9",
  "2:3",
  "3:2",
  "4:5",
  "5:4",
  "21:9",
];

const NANO_2_ASPECT_RATIOS = [
  ...NANO_ASPECT_RATIOS,
  "1:4",
  "4:1",
  "1:8",
  "8:1",
];

/** gpt-image-2: ratios or 1K pixels (docs 比例参考) */
const GPT_IMAGE_2_SIZES = [
  "auto",
  "1024x1024",
  "1672x941",
  "941x1672",
  "1443x1090",
  "1090x1443",
  "1536x1024",
  "1024x1536",
  "1408x1120",
  "1120x1408",
  "1920x832",
  "832x1920",
  "1792x896",
  "896x1792",
];

/** gpt-image-2-vip: pixel values only (1K / 2K / 4K), not ratio strings */
const GPT_IMAGE_2_VIP_SIZES = [
  "auto",
  "1024x1024",
  "2048x2048",
  "2880x2880",
  "1280x720",
  "2048x1152",
  "3840x2160",
  "720x1280",
  "1152x2048",
  "2160x3840",
  "1152x864",
  "2304x1728",
  "3264x2448",
  "864x1152",
  "1728x2304",
  "2448x3264",
  "1536x1024",
  "2048x1360",
  "3504x2336",
  "1024x1536",
  "1360x2048",
  "2336x3504",
  "1120x896",
  "2240x1792",
  "3200x2560",
  "896x1120",
  "1792x2240",
  "2560x3200",
  "1456x624",
  "2912x1248",
  "3840x1648",
  "624x1456",
  "1248x2912",
  "1648x3840",
  "688x2048",
  "1280x3840",
  "2048x688",
  "3840x1280",
  "1536x768",
  "3072x1536",
  "3840x1920",
  "768x1536",
  "1536x3072",
  "1920x3840",
];

export const MODEL_OPTIONS = [
  "gpt-image-2",
  "gpt-image-2-vip",
  "nano-banana-fast",
  "nano-banana-pro",
  "nano-banana-pro-preview",
  "nano-banana-pro-vt",
  "nano-banana-pro-cl",
  "nano-banana-pro-vip",
  "nano-banana-pro-4k-vip",
  "nano-banana-2",
  "nano-banana-2-cl",
  "nano-banana-2-4k-cl",
];

export const MODEL_SIZE_MAP = {
  "gpt-image-2": GPT_IMAGE_2_SIZES,
  "gpt-image-2-vip": GPT_IMAGE_2_VIP_SIZES,
  "nano-banana-fast": NANO_ASPECT_RATIOS,
  "nano-banana-pro": NANO_ASPECT_RATIOS,
  "nano-banana-pro-preview": NANO_ASPECT_RATIOS,
  "nano-banana-pro-vt": NANO_ASPECT_RATIOS,
  "nano-banana-pro-cl": NANO_ASPECT_RATIOS,
  "nano-banana-pro-vip": NANO_ASPECT_RATIOS,
  "nano-banana-pro-4k-vip": NANO_ASPECT_RATIOS,
  "nano-banana-2": NANO_2_ASPECT_RATIOS,
  "nano-banana-2-cl": NANO_2_ASPECT_RATIOS,
  "nano-banana-2-4k-cl": NANO_2_ASPECT_RATIOS,
};

const GPT_IMAGE_2_SIZE_LABELS = {
  "1024x1024": "1024x1024 (1:1)",
  "1672x941": "1672x941 (16:9)",
  "941x1672": "941x1672 (9:16)",
  "1443x1090": "1443x1090 (4:3)",
  "1090x1443": "1090x1443 (3:4)",
  "1536x1024": "1536x1024 (3:2)",
  "1024x1536": "1024x1536 (2:3)",
  "1408x1120": "1408x1120 (5:4)",
  "1120x1408": "1120x1408 (4:5)",
  "1920x832": "1920x832 (21:9)",
  "832x1920": "832x1920 (9:21)",
  "1792x896": "1792x896 (2:1)",
  "896x1792": "896x1792 (1:2)",
};

const GPT_IMAGE_2_VIP_SIZE_LABELS = {
  "1024x1024": "1024x1024 (1:1 1K)",
  "2048x2048": "2048x2048 (1:1 2K)",
  "2880x2880": "2880x2880 (1:1 4K)",
  "1280x720": "1280x720 (16:9 1K)",
  "2048x1152": "2048x1152 (16:9 2K)",
  "3840x2160": "3840x2160 (16:9 4K)",
  "720x1280": "720x1280 (9:16 1K)",
  "1152x2048": "1152x2048 (9:16 2K)",
  "2160x3840": "2160x3840 (9:16 4K)",
  "1152x864": "1152x864 (4:3 1K)",
  "2304x1728": "2304x1728 (4:3 2K)",
  "3264x2448": "3264x2448 (4:3 4K)",
  "864x1152": "864x1152 (3:4 1K)",
  "1728x2304": "1728x2304 (3:4 2K)",
  "2448x3264": "2448x3264 (3:4 4K)",
  "1536x1024": "1536x1024 (3:2 1K)",
  "2048x1360": "2048x1360 (3:2 2K)",
  "3504x2336": "3504x2336 (3:2 4K)",
  "1024x1536": "1024x1536 (2:3 1K)",
  "1360x2048": "1360x2048 (2:3 2K)",
  "2336x3504": "2336x3504 (2:3 4K)",
  "1120x896": "1120x896 (5:4 1K)",
  "2240x1792": "2240x1792 (5:4 2K)",
  "3200x2560": "3200x2560 (5:4 4K)",
  "896x1120": "896x1120 (4:5 1K)",
  "1792x2240": "1792x2240 (4:5 2K)",
  "2560x3200": "2560x3200 (4:5 4K)",
  "1456x624": "1456x624 (21:9 1K)",
  "2912x1248": "2912x1248 (21:9 2K)",
  "3840x1648": "3840x1648 (21:9 4K)",
  "624x1456": "624x1456 (9:21 1K)",
  "1248x2912": "1248x2912 (9:21 2K)",
  "1648x3840": "1648x3840 (9:21 4K)",
  "688x2048": "688x2048 (1:3 2K)",
  "1280x3840": "1280x3840 (1:3 4K)",
  "2048x688": "2048x688 (3:1 2K)",
  "3840x1280": "3840x1280 (3:1 4K)",
  "1536x768": "1536x768 (2:1 1K)",
  "3072x1536": "3072x1536 (2:1 2K)",
  "3840x1920": "3840x1920 (2:1 4K)",
  "768x1536": "768x1536 (1:2 1K)",
  "1536x3072": "1536x3072 (1:2 2K)",
  "1920x3840": "1920x3840 (1:2 4K)",
};

const SIZE_LABEL_MAP = {
  "gpt-image-2": GPT_IMAGE_2_SIZE_LABELS,
  "gpt-image-2-vip": GPT_IMAGE_2_VIP_SIZE_LABELS,
};

export const VIDEO_MODELS = [];

const IMAGE_SIZE_MODELS = [
  "nano-banana-pro",
  "nano-banana-pro-preview",
  "nano-banana-pro-vt",
  "nano-banana-pro-cl",
  "nano-banana-pro-vip",
  "nano-banana-pro-4k-vip",
  "nano-banana-2",
  "nano-banana-2-cl",
  "nano-banana-2-4k-cl",
];

const FORCED_4K_MODELS = ["nano-banana-2-4k-cl", "nano-banana-pro-4k-vip"];
const NO_4K_MODELS = ["nano-banana-2-cl", "nano-banana-pro-vip"];

export const normalizeModel = (model) =>
  MODEL_OPTIONS.includes(model) ? model : "gpt-image-2";

export const createDefaultSlot = (id) => ({
  id,
  prompt: "",
  size: "auto",
  variants: 1,
  model: "gpt-image-2",
  urls: [],
  imageSize: "1K",
  isGenerating: false,
});

export const getAvailableSizes = (model) => MODEL_SIZE_MAP[model] || ["auto"];

export const getSizeLabel = (model, size) => {
  if (!size) return size;
  return SIZE_LABEL_MAP[model]?.[size] || size;
};

export const applyModelChange = (slot, newModel) => {
  const availableSizes = getAvailableSizes(newModel);
  const newSize = availableSizes.includes(slot.size)
    ? slot.size
    : availableSizes[0];
  const next = { ...slot, model: newModel, size: newSize };

  if (FORCED_4K_MODELS.includes(newModel)) {
    next.imageSize = "4K";
  } else if (IMAGE_SIZE_MODELS.includes(newModel) && !slot.imageSize) {
    next.imageSize = "1K";
  }

  return next;
};

export const supportsImageSize = (model) => IMAGE_SIZE_MODELS.includes(model);

export const getImageSizeOptions = (model) => {
  if (!supportsImageSize(model)) return [];
  if (FORCED_4K_MODELS.includes(model)) return ["4K"];
  if (NO_4K_MODELS.includes(model)) return ["1K", "2K"];
  return ["1K", "2K", "4K"];
};
