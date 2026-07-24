"use client";

import { useEffect, useState } from "react";
import {
  getShowcaseImageSrcList,
  loadShowcaseManifest,
} from "../showcaseManifest";

export function useShowcaseImages() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    let cancelled = false;
    loadShowcaseManifest().then((items) => {
      if (!cancelled) {
        setImages(getShowcaseImageSrcList(items));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return images;
}

export function pickRandomShowcaseImage(images) {
  if (!images?.length) return null;
  return images[Math.floor(Math.random() * images.length)];
}
