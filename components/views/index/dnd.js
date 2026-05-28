export const GENERATED_IMAGE_DRAG_TYPE = "application/x-cobabaai-image-url";

export const setGeneratedImageDragData = (event, url) => {
  event.dataTransfer.setData(GENERATED_IMAGE_DRAG_TYPE, url);
  event.dataTransfer.setData("text/uri-list", url);
  event.dataTransfer.setData("text/plain", url);
  event.dataTransfer.effectAllowed = "copy";
};

export const getGeneratedImageDragUrl = (event) => {
  const url =
    event.dataTransfer.getData(GENERATED_IMAGE_DRAG_TYPE) ||
    event.dataTransfer.getData("text/uri-list") ||
    event.dataTransfer.getData("text/plain");

  return url?.trim() || "";
};

export const isImageReferenceUrl = (url) =>
  url.startsWith("http://") ||
  url.startsWith("https://") ||
  url.startsWith("data:image/");
