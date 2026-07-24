"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import GenerateSection from "@/components/views/index/generate-section";

function BatchInner() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const initialModel = searchParams.get("model") || "";

  return (
    <GenerateSection
      initialPrompt={initialPrompt}
      initialModel={initialModel}
    />
  );
}

export default function BatchPageClient() {
  return (
    <Suspense
      fallback={
        <div className="img-pricing-empty" style={{ paddingTop: 48 }}>
          加载中…
        </div>
      }
    >
      <BatchInner />
    </Suspense>
  );
}
