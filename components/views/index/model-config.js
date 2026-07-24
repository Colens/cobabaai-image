export const MODEL_OPTIONS = [
  "gpt-image-2",
  "nano-banana-fast",
  "nano-banana-pro",
  "nano-banana-pro-vt",
  "nano-banana-pro-cl",
  "nano-banana-pro-vip",
  "nano-banana-pro-4k-vip",
  "nano-banana-2",
  "nano-banana-2-cl",
  "nano-banana-2-4k-cl",
];

export const MODEL_SIZE_MAP = {
  "gpt-image-2": [
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
  ],
  "nano-banana-fast": [
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
  ],
  "nano-banana-pro": [
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
  ],
  "nano-banana-pro-vt": [
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
  ],
  "nano-banana-pro-cl": [
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
  ],
  "nano-banana-pro-vip": [
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
  ],
  "nano-banana-pro-4k-vip": [
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
  ],
  "nano-banana-2": [
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
    "1:4",
    "4:1",
    "1:8",
    "8:1",
  ],
  "nano-banana-2-cl": [
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
    "1:4",
    "4:1",
    "1:8",
    "8:1",
  ],
  "nano-banana-2-4k-cl": [
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
    "1:4",
    "4:1",
    "1:8",
    "8:1",
  ],
};

export const VIDEO_MODELS = [];

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
  webHook: "-1",
  isGenerating: false,
});

export const getAvailableSizes = (model) => MODEL_SIZE_MAP[model] || ["auto"];

export const applyModelChange = (slot, newModel) => {
  const availableSizes = getAvailableSizes(newModel);
  const newSize = availableSizes.includes(slot.size)
    ? slot.size
    : availableSizes[0];
  const next = { ...slot, model: newModel, size: newSize };

  if (newModel === "nano-banana-2-4k-cl" || newModel === "nano-banana-pro-4k-vip") {
    next.imageSize = "4K";
  } else if (
    [
      "nano-banana-pro",
      "nano-banana-pro-vt",
      "nano-banana-pro-cl",
      "nano-banana-pro-vip",
      "nano-banana-2",
      "nano-banana-2-cl",
    ].includes(newModel) &&
    !slot.imageSize
  ) {
    next.imageSize = "1K";
  }

  return next;
};

export const supportsImageSize = (model) =>
  [
    "nano-banana-pro",
    "nano-banana-pro-vt",
    "nano-banana-pro-cl",
    "nano-banana-pro-vip",
    "nano-banana-pro-4k-vip",
    "nano-banana-2",
    "nano-banana-2-cl",
    "nano-banana-2-4k-cl",
  ].includes(model);
