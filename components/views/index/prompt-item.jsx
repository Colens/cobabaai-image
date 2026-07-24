"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MODEL_OPTIONS,
  applyModelChange,
  getAvailableSizes,
  supportsImageSize,
} from "./model-config";
import { ArrowUp, Plus, Trash2, X } from "lucide-react";
import ImagePreviewModal from "./image-preview-modal";
import { getGeneratedImageDragUrl, isImageReferenceUrl } from "./dnd";

const readFilesAsDataUrls = (files) =>
  Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    ),
  );

const validateImageFiles = (files) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      alert("图片大小必须小于 10MB");
      return false;
    }
    if (!allowedTypes.includes(file.type)) {
      alert("只允许上传 JPG, JPEG, PNG 和 WebP 文件");
      return false;
    }
  }
  return true;
};

const PromptItem = ({
  index,
  slot,
  onChange,
  onSend,
  onRemove,
  canRemove,
}) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const addReferenceUrl = (url) => {
    if (!isImageReferenceUrl(url)) return;
    if (slot.urls.includes(url)) return;
    if (slot.urls.length >= 8) {
      alert("最多只能上传 8 张参考图");
      return;
    }
    onChange({ ...slot, urls: [...slot.urls, url] });
  };

  const handleFiles = async (files) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    if (slot.urls.length + imageFiles.length > 8) {
      alert("最多只能上传 8 张参考图");
      return;
    }
    if (!validateImageFiles(imageFiles)) return;
    const dataUrls = await readFilesAsDataUrls(imageFiles);
    onChange({ ...slot, urls: [...slot.urls, ...dataUrls] });
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const draggedUrl = getGeneratedImageDragUrl(e);
    if (draggedUrl && isImageReferenceUrl(draggedUrl)) {
      addReferenceUrl(draggedUrl);
      return;
    }

    if (e.dataTransfer.files?.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md ${
        isDragOver
          ? "border-foreground/40 bg-muted ring-2 ring-foreground/15"
          : "border-border"
      }`}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsDragOver(false);
        }
      }}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          对话框 #{index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="删除此对话框"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="p-3">
        {slot.urls.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {slot.urls.map((url, i) => (
              <div
                key={i}
                className="relative h-14 w-14 overflow-hidden rounded-lg border border-border"
              >
                <button
                  type="button"
                  onClick={() => setPreviewUrl(url)}
                  className="h-full w-full cursor-zoom-in"
                  title="点击查看大图"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({
                      ...slot,
                      urls: slot.urls.filter((_, idx) => idx !== i),
                    });
                  }}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Textarea
          value={slot.prompt}
          onChange={(e) => onChange({ ...slot, prompt: e.target.value })}
          placeholder="输入提示词，或拖入图片/生成结果作为参考..."
          className="min-h-[72px] resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
          rows={3}
        />

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/60 pt-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                await handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 hover:bg-muted"
              title="添加参考图"
            >
              <Plus className="h-4 w-4" />
            </button>

            <Select
              value={slot.model}
              onValueChange={(model) => onChange(applyModelChange(slot, model))}
            >
              <SelectTrigger className="h-8 max-w-[130px] border-border/60 bg-muted/30 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_OPTIONS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={slot.size}
              onValueChange={(size) => onChange({ ...slot, size })}
            >
              <SelectTrigger className="h-8 max-w-[90px] border-border/60 bg-muted/30 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAvailableSizes(slot.model).map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {supportsImageSize(slot.model) && (
              <Select
                value={slot.imageSize || "1K"}
                onValueChange={(imageSize) => onChange({ ...slot, imageSize })}
              >
                <SelectTrigger className="h-8 max-w-[70px] border-border/60 bg-muted/30 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {slot.model !== "nano-banana-2-4k-cl" &&
                    slot.model !== "nano-banana-pro-4k-vip" && (
                      <>
                        <SelectItem value="1K">1K</SelectItem>
                        <SelectItem value="2K">2K</SelectItem>
                      </>
                    )}
                  {slot.model !== "nano-banana-2-cl" &&
                    slot.model !== "nano-banana-pro-vip" && (
                      <SelectItem value="4K">4K</SelectItem>
                    )}
                </SelectContent>
              </Select>
            )}
          </div>

          <Button
            size="icon"
            disabled={
              slot.isGenerating ||
              (!slot.prompt?.trim() && slot.urls.length === 0)
            }
            onClick={onSend}
            className="h-9 w-9 shrink-0 rounded-full bg-foreground text-background hover:bg-foreground/90"
            title="生成图像"
          >
            {slot.isGenerating ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <ImagePreviewModal src={previewUrl} onClose={() => setPreviewUrl(null)} />
    </div>
  );
};

export default PromptItem;
