export const SHOWCASE_MANIFEST_URL = "/image-site/showcase/manifest.json";

let manifestPromise = null;
let cachedItems = null;

export function loadShowcaseManifest() {
  if (cachedItems) {
    return Promise.resolve(cachedItems);
  }
  if (!manifestPromise) {
    manifestPromise = fetch(SHOWCASE_MANIFEST_URL)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        cachedItems = Array.isArray(data) ? data : [];
        return cachedItems;
      })
      .catch(() => {
        manifestPromise = null;
        cachedItems = [];
        return cachedItems;
      });
  }
  return manifestPromise;
}

export function getShowcaseImageSrcList(items) {
  return (items || []).map((item) => item.src).filter(Boolean);
}

export function getCachedShowcaseManifest() {
  return cachedItems;
}
