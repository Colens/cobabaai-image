"use client";

import { useEffect, useRef, useState } from "react";
import AnimatedMasonryItem from "./AnimatedMasonryItem";
import {
  getCachedShowcaseManifest,
  loadShowcaseManifest,
} from "./showcaseManifest";

const INITIAL_BATCH = 24;
const LOAD_BATCH = 24;

export default function ShowcaseGallery() {
  const [items, setItems] = useState(() => getCachedShowcaseManifest() || []);
  const [loading, setLoading] = useState(() => !getCachedShowcaseManifest());
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadShowcaseManifest().then((data) => {
      if (!cancelled && data.length > 0) {
        setItems(data);
      }
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || visibleCount >= items.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((prev) =>
            Math.min(prev + LOAD_BATCH, items.length),
          );
        }
      },
      { rootMargin: "480px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [items.length, visibleCount]);

  if (loading) {
    return (
      <section className="img-site-showcase" aria-busy="true">
        <div className="img-site-masonry img-site-masonry--skeleton">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="img-site-masonry-item img-site-masonry-item--skeleton"
              style={{ aspectRatio: 0.75 + (i % 4) * 0.15 }}
            />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const visibleItems = items.slice(0, visibleCount);

  return (
    <section className="img-site-showcase" aria-label="社区作品">
      <div className="img-site-masonry">
        {visibleItems.map((item, index) => (
          <AnimatedMasonryItem
            key={item.src || index}
            item={item}
            index={index}
            eager={index < 6}
          />
        ))}
      </div>
      {visibleCount < items.length && (
        <div
          ref={loadMoreRef}
          className="img-site-showcase-sentinel"
          aria-hidden="true"
        />
      )}
    </section>
  );
}
