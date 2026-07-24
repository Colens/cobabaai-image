"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Pencil, Loader2, Archive, Trash2, Clock } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import config from "@/config";
import { VIDEO_MODELS } from "./model-config";
import ImagePreviewModal from "./image-preview-modal";
import { setGeneratedImageDragData } from "./dnd";

const RESULT_URL_TTL_MS = config.ResultUrlTtlHours * 60 * 60 * 1000;

const getUrlExpiryLabel = (completedAt) => {
  if (!completedAt) {
    return {
      expired: null,
      label: `链接有效期 ${config.ResultUrlTtlHours} 小时`,
    };
  }

  const remainingMs = completedAt + RESULT_URL_TTL_MS - Date.now();
  if (remainingMs <= 0) {
    return { expired: true, label: "链接已过期" };
  }

  const totalMinutes = Math.ceil(remainingMs / 60000);
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return {
      expired: false,
      label:
        minutes > 0
          ? `剩余 ${hours} 小时 ${minutes} 分`
          : `剩余 ${hours} 小时`,
    };
  }

  return { expired: false, label: `剩余 ${totalMinutes} 分钟` };
};

const downloadImage = async (url, filename) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const fetchAsBlob = async (url, filename, index, isVideo) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const contentType = response.headers.get("content-type") || "";
    let ext = isVideo ? "mp4" : "png";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = "jpg";
    else if (contentType.includes("webp")) ext = "webp";
    else if (contentType.includes("gif")) ext = "gif";
    else if (contentType.includes("mp4")) ext = "mp4";
    else if (contentType.includes("webm")) ext = "webm";

    const urlExt = url.match(/\.([^./?#]+)($|\?|#)/i)?.[1]?.toLowerCase();
    if (
      urlExt &&
      ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm"].includes(urlExt)
    ) {
      ext = urlExt === "jpeg" ? "jpg" : urlExt;
    }

    return { blob, filename: `${filename}.${ext}` };
  } catch {
    return null;
  }
};

const isAuthErrorResult = (result) =>
  /api key|invalid token|unauthorized|未授权/i.test(
    result?.error || result?.failureReason || "",
  );

const ResultsPanel = ({ results, onEdit, onToggleInvalidated, onClearAll }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [brokenSrcs, setBrokenSrcs] = useState(() => new Set());
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const visibleResults = results.filter(
    (r) => r.src || !r.finish || !isAuthErrorResult(r),
  );
  const finishedResults = visibleResults.filter((r) => r.finish && r.src);
  const finishedCount = finishedResults.length;
  const runningCount = visibleResults.filter((r) => !r.finish).length;

  const isResultDownloadable = (result) => {
    if (!result.finish || !result.src) return false;
    if (brokenSrcs.has(result.src)) return false;
    const expiry = getUrlExpiryLabel(result.completedAt);
    return expiry.expired !== true;
  };

  const downloadableResults = finishedResults.filter(isResultDownloadable);

  const handleBatchDownload = async () => {
    if (downloadableResults.length === 0 || downloading) {
      if (finishedCount > 0 && downloadableResults.length === 0) {
        alert("没有可下载的图片，链接可能已过期，请重新生成。");
      }
      return;
    }

    setDownloading(true);
    try {
      const zip = new JSZip();
      let index = 0;

      for (const result of downloadableResults) {
        index += 1;
        const isVideo = result.model && VIDEO_MODELS.includes(result.model);
        const file = await fetchAsBlob(
          result.src,
          `generated-${index}`,
          index,
          isVideo,
        );
        if (file) {
          let name = file.filename;
          if (zip.file(name)) {
            const ext = name.split(".").pop();
            name = `generated-${index}-${result.id.slice(0, 6)}.${ext}`;
          }
          zip.file(name, file.blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `generated-images-${Date.now()}.zip`);
    } catch (error) {
      console.error("批量下载失败:", error);
      alert("批量下载失败，请稍后重试");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">生成结果</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {finishedCount} 张{runningCount > 0 ? ` · ${runningCount} 生成中` : ""}
          </span>
          {finishedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-3 text-sm font-semibold"
              disabled={downloading}
              onClick={handleBatchDownload}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              批量下载
            </Button>
          )}
          {visibleResults.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-3 text-sm font-semibold text-destructive hover:text-destructive"
              onClick={onClearAll}
            >
              <Trash2 className="h-4 w-4" />
              清空全部
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/60" />
        <p>
          图片链接有效期为 <strong className="text-foreground">{config.ResultUrlTtlHours} 小时</strong>
          ，过期后将无法预览，请尽快批量下载保存。浏览器内最多保留 50 条记录。
        </p>
      </div>

      <div className="min-h-[200px] flex-1 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 p-2 scrollbar-thin">
        {visibleResults.length === 0 ? (
          <div className="flex min-h-[160px] items-center justify-center text-xs text-muted-foreground">
            生成的图片将汇总显示在这里
          </div>
        ) : (
          <div className="grid grid-cols-2 content-start gap-2 sm:grid-cols-3 md:grid-cols-4">
            {visibleResults.map((result, index) => {
              const isVideo =
                result.model && VIDEO_MODELS.includes(result.model);
              const isInvalidated = !!result.invalidated;
              const expiry = result.finish && result.src ? getUrlExpiryLabel(result.completedAt) : null;
              const isBroken =
                result.finish &&
                result.src &&
                (brokenSrcs.has(result.src) || expiry?.expired === true);

              return (
                <div
                  key={result.id}
                  className={`group relative aspect-square w-full overflow-hidden rounded-lg border bg-card ${
                    isInvalidated
                      ? "border-muted-foreground/40 opacity-60"
                      : "border-border/60"
                  }`}
                >
                  {!result.finish ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-2">
                      <Loader2 className="h-5 w-5 animate-spin text-foreground/70" />
                      <div className="w-full px-1">
                        <div className="h-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-foreground transition-all"
                            style={{ width: `${result.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : result.error || result.failureReason ? (
                    <div className="flex h-full items-center justify-center p-2 text-center text-[10px] text-destructive">
                      {result.error || result.failureReason || "失败"}
                    </div>
                  ) : isBroken ? (
                    <div className="flex h-full flex-col items-center justify-center gap-1 bg-muted p-2 text-center">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        链接已过期
                      </span>
                      <span className="text-[9px] text-muted-foreground/80">
                        有效期 {config.ResultUrlTtlHours} 小时，请重新生成
                      </span>
                    </div>
                  ) : isVideo ? (
                    <video
                      src={result.src}
                      className={`h-full w-full object-cover ${
                        isInvalidated ? "grayscale" : "cursor-pointer"
                      }`}
                      muted
                      playsInline
                      onClick={() => !isInvalidated && setPreviewUrl(result.src)}
                      onError={() =>
                        setBrokenSrcs((prev) => new Set(prev).add(result.src))
                      }
                    />
                  ) : (
                    <img
                      src={result.src}
                      alt={`结果 ${index + 1}`}
                      draggable={!isInvalidated}
                      onDragStart={(e) => {
                        if (isInvalidated) return;
                        setGeneratedImageDragData(e, result.src);
                      }}
                      className={`h-full w-full object-cover ${
                        isInvalidated
                          ? "grayscale"
                          : "cursor-grab active:cursor-grabbing"
                      }`}
                      onClick={() => !isInvalidated && setPreviewUrl(result.src)}
                      onError={() =>
                        setBrokenSrcs((prev) => new Set(prev).add(result.src))
                      }
                    />
                  )}

                  {result.finish && result.src && (
                    <>
                      {isInvalidated && (
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-destructive/90 py-1 text-center text-xs font-bold tracking-wide text-white">
                          失效
                        </div>
                      )}

                      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-1 bg-gradient-to-b from-black/60 to-transparent p-1.5">
                        <button
                          type="button"
                          title={isInvalidated ? "恢复" : "标记失效"}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleInvalidated(result.id);
                          }}
                          className={`shrink-0 rounded-md p-1 text-white transition-colors ${
                            isInvalidated
                              ? "bg-emerald-600/90 hover:bg-emerald-600"
                              : "bg-black/40 hover:bg-destructive/90"
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        {!isInvalidated && (
                          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-6 px-2 text-[10px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(
                                  result.src,
                                  `generated-${index + 1}.${isVideo ? "mp4" : "png"}`,
                                );
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-6 px-2 text-[10px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(result.slotId, result.src);
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {expiry && !isBroken && (
                        <div
                          className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-4 text-center text-[9px] font-medium text-white ${
                            expiry.expired === true
                              ? "text-red-200"
                              : expiry.expired === false &&
                                  Math.ceil(
                                    (result.completedAt + RESULT_URL_TTL_MS - Date.now()) /
                                      60000,
                                  ) <= 30
                                ? "text-amber-200"
                                : ""
                          }`}
                        >
                          {expiry.label}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ImagePreviewModal src={previewUrl} onClose={() => setPreviewUrl(null)} />
    </div>
  );
};

export default ResultsPanel;
