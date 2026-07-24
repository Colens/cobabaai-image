"use client";

import { useEffect, useRef, useState } from "react";

const COLS_ESTIMATE = 5;
const ROW_STAGGER_MS = 32;
const COL_STAGGER_MS = 32;

function computeFlipDelay(index) {
  const col = index % COLS_ESTIMATE;
  const row = Math.floor(index / COLS_ESTIMATE);
  return row * ROW_STAGGER_MS + col * COL_STAGGER_MS;
}

export default function AnimatedMasonryItem({ item, index, eager }) {
  const rootRef = useRef(null);
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;

    const startFlip = () => {
      el.style.setProperty("--flip-delay", `${computeFlipDelay(index)}ms`);
      setPhase("flipping");
    };

    if (eager) {
      startFlip();
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          startFlip();
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "120px 0px 80px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index, eager]);

  const handleAnimationEnd = (e) => {
    if (e.animationName === "img-scale-flip") {
      setPhase("done");
    }
  };

  return (
    <figure
      ref={rootRef}
      className={`img-site-masonry-item img-site-masonry-item--animated${
        phase === "flipping" ? " is-flipping" : ""
      }${phase === "done" ? " is-done" : ""}`}
      style={{ aspectRatio: item.aspectRatio || 1 }}
    >
      <div className="img-site-masonry-flip" onAnimationEnd={handleAnimationEnd}>
        <img
          src={item.src}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "low"}
          width={item.width || undefined}
          height={item.height || undefined}
        />
      </div>
    </figure>
  );
}
