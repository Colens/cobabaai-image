"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE_ROUTES } from "./routes";

function joinAllCandidates(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) return "";
  return candidates
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .join("\n\n");
}

export default function PromptClaimPage() {
  const [claimCode, setClaimCode] = useState("");
  const [prompt, setPrompt] = useState("");
  const [candidateCount, setCandidateCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClaim = async (e) => {
    e.preventDefault();
    const value = claimCode.trim();
    setError("");
    setPrompt("");
    setCandidateCount(0);
    setCopied(false);

    if (!value) {
      setError("请输入领取码");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/prompt-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimCode: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "领取失败");
        return;
      }

      const joined =
        typeof data.prompt === "string" && data.prompt
          ? data.prompt
          : joinAllCandidates(data.allCandidates);
      if (!joined) {
        setError("领取码无效");
        return;
      }

      setPrompt(joined);
      setCandidateCount(
        Array.isArray(data.allCandidates) ? data.allCandidates.length : 0,
      );
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("复制失败，请手动选择文本");
    }
  };

  const handleUseInBatch = () => {
    if (!prompt) return;
    const params = new URLSearchParams({ prompt });
    window.location.href = `${SITE_ROUTES.batch}?${params.toString()}`;
  };

  return (
    <div className="img-pricing-page">
      <div className="img-pricing-page__inner" style={{ maxWidth: 720 }}>
        <h1 className="img-pricing-page__title">提示词领取</h1>
        <p className="img-pricing-page__sub">
          输入领取码获取对应提示词。领取码不可猜测，请妥善保管。
        </p>

        <form
          className="img-batch-panel"
          style={{ padding: 20 }}
          onSubmit={handleClaim}
        >
          <label
            htmlFor="claim-code-input"
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
              color: "var(--img-text)",
            }}
          >
            领取码
          </label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              id="claim-code-input"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value)}
              placeholder="例如 RWDUK-JWKD4"
              autoComplete="off"
              spellCheck={false}
              className="img-site-prompt-input"
              style={{
                flex: "1 1 220px",
                minHeight: 44,
                border: "1px solid var(--img-border-strong)",
                borderRadius: 12,
                padding: "10px 14px",
                background: "var(--img-bg-elevated)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            />
            <button
              type="submit"
              className="img-site-btn img-site-btn-solid"
              disabled={loading}
              style={{ minWidth: 96 }}
            >
              {loading ? "领取中…" : "领取"}
            </button>
          </div>

          {error ? (
            <p
              style={{
                margin: "14px 0 0",
                color: "#b91c1c",
                fontSize: 14,
              }}
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </form>

        {prompt ? (
          <div
            className="img-batch-panel"
            style={{ padding: 20, marginTop: 16 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                提示词
                {candidateCount > 0 ? (
                  <span
                    style={{
                      marginLeft: 8,
                      fontWeight: 500,
                      color: "var(--img-text-muted)",
                      fontSize: 13,
                    }}
                  >
                    （已拼接 {candidateCount} 段）
                  </span>
                ) : null}
              </h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="img-site-btn img-site-btn-ghost img-site-btn-ghost--sm"
                  onClick={handleCopy}
                >
                  {copied ? "已复制" : "复制"}
                </button>
                <button
                  type="button"
                  className="img-site-btn img-site-btn-solid img-site-btn-solid--sm"
                  onClick={handleUseInBatch}
                >
                  去批量生图
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={prompt}
              rows={16}
              className="img-site-prompt-input"
              style={{
                width: "100%",
                border: "1px solid var(--img-border)",
                borderRadius: 12,
                padding: 14,
                background: "var(--img-bg-muted)",
                resize: "vertical",
                lineHeight: 1.55,
                fontSize: 14,
              }}
            />
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 12,
                color: "var(--img-text-subtle)",
              }}
            >
              也可在{" "}
              <Link
                href={SITE_ROUTES.batch}
                style={{ textDecoration: "underline" }}
              >
                批量生图
              </Link>{" "}
              中粘贴使用。
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
