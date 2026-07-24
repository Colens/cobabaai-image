"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HOME_COPY } from "./constants";
import { SITE_ROUTES } from "./routes";
import ShowcaseGallery from "./ShowcaseGallery";

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const copy = HOME_COPY;

  const handleGenerate = () => {
    const text = prompt.trim();
    if (!text) return;
    const params = new URLSearchParams({ prompt: text });
    router.push(`${SITE_ROUTES.batch}?${params.toString()}`);
  };

  const handlePromptKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="img-site-root img-site-root--ideogram">
      <section className="img-site-hero img-site-hero--compact">
        <div className="img-site-hero-glow" aria-hidden="true" />
        <div className="img-site-hero-inner">
          <h1 className="img-site-title img-site-title--compact">{copy.title}</h1>
          <p className="img-site-subtitle img-site-subtitle--compact">
            {copy.subtitle}
          </p>
        </div>
      </section>

      <ShowcaseGallery />

      <div className="img-site-prompt-dock" role="region" aria-label={copy.promptAria}>
        <div className="img-site-prompt-dock-inner">
          <div className="img-site-prompt img-site-prompt--dock">
            <div className="img-site-prompt-inner img-site-prompt-inner--input">
              <button
                type="button"
                className="img-site-prompt-btn"
                onClick={handleGenerate}
              >
                {copy.generateImage}
              </button>
              <textarea
                className="img-site-prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handlePromptKeyDown}
                placeholder={copy.promptPlaceholder}
                rows={1}
                aria-label={copy.promptPlaceholder}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
