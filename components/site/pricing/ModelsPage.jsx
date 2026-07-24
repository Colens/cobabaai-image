"use client";

import { useMemo } from "react";
import ModelCard from "./ModelCard";
import { getDefaultModelList } from "./modelPrices";
import { pickRandomShowcaseImage, useShowcaseImages } from "./useShowcaseImages";
import { SITE_BRAND } from "../constants";

export default function ModelsPage({ initialModels }) {
  const models = initialModels?.length ? initialModels : getDefaultModelList();
  const showcaseImages = useShowcaseImages();

  const cardBackgrounds = useMemo(() => {
    if (!showcaseImages.length || !models.length) return {};
    return Object.fromEntries(
      models.map((model) => [
        model.model_name,
        pickRandomShowcaseImage(showcaseImages),
      ]),
    );
  }, [models, showcaseImages]);

  return (
    <div className="img-pricing-page">
      <div className="img-pricing-page__inner">
        <h1 className="img-pricing-page__title">模型列表</h1>
        <p className="img-pricing-page__sub">
          选择模型查看价格，或进入批量生图开始创作。价格与{" "}
          <a
            href={SITE_BRAND.pricingDocsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            CobabaAi 计费文档
          </a>{" "}
          同步（1 元 = 100 积分）。
        </p>

        {models.length === 0 ? (
          <div className="img-pricing-empty">暂无模型数据</div>
        ) : (
          <div className="img-pricing-grid">
            {models.map((model, index) => (
              <ModelCard
                key={model.model_name || index}
                model={model}
                bgSrc={cardBackgrounds[model.model_name]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
