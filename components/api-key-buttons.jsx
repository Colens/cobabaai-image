"use client";

import { useState, useEffect } from "react";
import { SITE_ROUTES } from "@/components/site/routes";

const ApiKeyButtons = () => {
  const [apiKey, setApiKey] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const savedApiKey = localStorage.getItem("apikey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      alert("API Key 不能为空");
      return;
    }
    localStorage.setItem("apikey", trimmed);
    setApiKey(trimmed);
    setOpen(false);
  };

  const openDialog = () => {
    setDraft(localStorage.getItem("apikey") || "");
    setOpen(true);
  };

  return (
    <>
      <a
        href={SITE_ROUTES.apiKey}
        target="_blank"
        rel="noopener noreferrer"
        className="img-site-btn img-site-btn-ghost img-site-btn-ghost--sm"
      >
        获取 API Key
      </a>
      <button
        type="button"
        className="img-site-btn img-site-btn-solid img-site-btn-solid--sm"
        onClick={openDialog}
      >
        {apiKey ? "已设置 Key" : "设置 API Key"}
      </button>

      {open && (
        <div
          className="img-studio-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="api-key-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="img-studio"
            style={{ maxWidth: 480, maxHeight: "none", height: "auto" }}
          >
            <div className="img-studio__header">
              <h2 id="api-key-dialog-title" className="img-studio__header-title">
                设置 CobabaAi API Key
              </h2>
              <button
                type="button"
                className="img-studio__close"
                onClick={() => setOpen(false)}
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <div style={{ padding: 18 }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="请输入您的 CobabaAi API Key"
                className="img-site-prompt-input"
                style={{
                  width: "100%",
                  minHeight: 44,
                  border: "1px solid var(--img-border-strong)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  background: "var(--img-bg-elevated)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                <button
                  type="button"
                  className="img-site-btn img-site-btn-ghost"
                  onClick={() => setOpen(false)}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="img-site-btn img-site-btn-solid"
                  onClick={handleSaveApiKey}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApiKeyButtons;
