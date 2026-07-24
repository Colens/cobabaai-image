"use client";

import Link from "next/link";
import { SITE_ROUTES } from "../routes";

export default function ModelCard({ model, bgSrc }) {
  const href = `${SITE_ROUTES.batch}?model=${encodeURIComponent(model.model_name)}`;

  return (
    <article className="img-model-card">
      {bgSrc ? (
        <img className="img-model-card__bg" src={bgSrc} alt="" loading="lazy" />
      ) : (
        <div className="img-model-card__bg-fallback" aria-hidden="true" />
      )}

      <div className="img-model-card__triangle">
        <div className="img-model-card__triangle-inner">
          <h3 className="img-model-card__name">{model.model_name}</h3>
          <p className="img-model-card__price">{model.price_line}</p>
        </div>
      </div>

      <Link href={href} className="img-model-card__doc-btn">
        批量生图
      </Link>
    </article>
  );
}
