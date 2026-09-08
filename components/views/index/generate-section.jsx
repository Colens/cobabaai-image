"use client";

import { useEffect, useRef, useState } from "react";
import config from "@/config";
import { v4 as uuidv4 } from "uuid";
import PromptListPanel from "./prompt-list-panel";
import ResultsPanel from "./results-panel";
import {
  createDefaultSlot,
  supportsImageSize,
  normalizeModel,
  applyModelChange,
} from "./model-config";

const STORAGE_KEY = "batchPromptData";

const isStorableUrl = (url) =>
  typeof url === "string" &&
  (url.startsWith("http://") || url.startsWith("https://"));

const serializeSlots = (slots) =>
  slots.map(({ isGenerating, urls, ...rest }) => ({
    ...rest,
    urls: (urls || []).filter(isStorableUrl),
  }));

const MAX_STORED_RESULTS = 50;

const serializeResults = (results) =>
  (Array.isArray(results) ? results : [])
    .filter(
      (result) =>
        !/api key|invalid token|unauthorized|未授权/i.test(result?.error || ""),
    )
    .slice(0, MAX_STORED_RESULTS)
    .map((result) => ({
      ...result,
      src: isStorableUrl(result?.src) ? result.src : "",
    }));

const normalizeStoredResults = (raw) => {
  if (Array.isArray(raw)) return serializeResults(raw);
  if (raw && typeof raw === "object") {
    return serializeResults(Object.values(raw));
  }
  return [];
};

const saveToStorage = (data) => {
  try {
    const payload = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    console.warn("localStorage quota exceeded, saving minimal data:", error);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          slots: data.slots.map(({ prompt, model, size, imageSize, id }) => ({
            id,
            prompt,
            model,
            size,
            imageSize,
            urls: [],
            variants: 1,
          })),
          results: [],
          masterPrompt: data.masterPrompt,
        }),
      );
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};

const GenerateSection = ({ initialPrompt = "", initialModel = "" }) => {
  const [slots, setSlots] = useState([createDefaultSlot(uuidv4())]);
  const [results, setResults] = useState([]);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const removeResult = (resultId) => {
    setResults((prev) => prev.filter((item) => item.id !== resultId));
  };

  const isAuthError = (message, status) =>
    status === 401 ||
    /api key|invalid token|unauthorized|未授权|无效/i.test(message || "");

  const updateResult = (resultId, patch) => {
    setResults((prev) =>
      prev.map((item) =>
        item.id === resultId ? { ...item, ...patch } : item,
      ),
    );
  };

  const [masterPrompt, setMasterPrompt] = useState("");

  const getAPIKEY = () => {
    const savedApiKey = localStorage.getItem("apikey")?.trim();
    return savedApiKey || process.env.API_KEY;
  };

  const asText = (value) => {
    if (typeof value !== "string") return "";
    const text = value.trim();
    return !text || text === "undefined" ? "" : text;
  };

  const extractApiMessage = (data, fallback = "生成失败") => {
    const fallbackText = asText(fallback) || "生成失败";
    if (!data || typeof data !== "object") return fallbackText;

    const fromErrorObject =
      data.error && typeof data.error === "object"
        ? asText(data.error.message) ||
          asText(data.error.msg) ||
          asText(data.error.detail)
        : "";

    return (
      asText(typeof data.error === "string" ? data.error : "") ||
      fromErrorObject ||
      asText(data.message) ||
      asText(data.msg) ||
      asText(data.failure_reason) ||
      asText(data.data?.error) ||
      asText(data.data?.message) ||
      asText(data.data?.msg) ||
      fallbackText
    );
  };

  const notifyError = (message, fallback = "生成失败") => {
    alert(asText(message) || asText(fallback) || "生成失败");
  };

  const unwrapTaskPayload = (data) => {
    if (!data || typeof data !== "object") return {};
    const nested = data.data;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return {
        ...nested,
        id: nested.id || data.id || nested.task_id,
        status: nested.status || data.status,
        progress: nested.progress ?? data.progress,
        results: nested.results || data.results,
        error: nested.error || data.error,
      };
    }
    return data;
  };

  const getTaskId = (data) =>
    data?.id || data?.task_id || data?.data?.id || data?.data?.task_id || "";

  const getTaskStatus = (data) =>
    String(data?.status || data?.state || data?.data?.status || "").toLowerCase();

  const extractResultUrl = (data) => {
    const results = data?.results || data?.data?.results;
    if (Array.isArray(results) && results[0]?.url) return results[0].url;
    if (typeof data?.url === "string") return data.url;
    if (typeof data?.data?.url === "string") return data.data.url;
    return "";
  };

  const isTaskFailed = (status) =>
    status === "failed" || status === "violation" || status === "error";

  const isTaskSucceeded = (status, data) =>
    status === "succeeded" ||
    status === "success" ||
    status === "completed" ||
    (!status && !!extractResultUrl(data));

  const buildRequestData = (slot) => {
    const requestData = {
      model: slot.model,
      prompt: slot.prompt || "",
      images: slot.urls || [],
      aspectRatio: slot.size || "auto",
      replyType: "async",
    };

    if (supportsImageSize(slot.model)) {
      requestData.imageSize = slot.imageSize || "1K";
    }

    return requestData;
  };

  const updateSlot = (slotId, patch) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, ...patch } : slot)),
    );
  };

  const handleTask = async (resultId, taskId, slotId) => {
    const baseUrl = config.ApiBaseUrl;
    const pollIntervalMs = 2000;
    const maxPolls = 450;

    try {
      for (let i = 0; i < maxPolls; i++) {
        const res = await fetch(
          `${baseUrl}/v1/api/result?id=${encodeURIComponent(taskId)}`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + getAPIKEY(),
            },
            cache: "no-store",
          },
        );

        let result = {};
        try {
          result = unwrapTaskPayload(await res.json());
        } catch {
          result = {};
        }

        const status = getTaskStatus(result);
        const errorMessage = extractApiMessage(result, `请求失败 (${res.status})`);

        if (status === "running" || status === "submitted" || status === "queued") {
          updateResult(resultId, {
            finish: false,
            progress: result.progress ?? result.data?.progress ?? 0,
          });
          await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
          continue;
        }

        if (isTaskFailed(status)) {
          const message =
            status === "violation"
              ? errorMessage || "提示词或图片内容违规，请修改后重试"
              : errorMessage || `请求失败 (${res.status})`;
          updateResult(resultId, {
            finish: true,
            progress: 100,
            failureReason: message,
            error: message,
          });
          return;
        }

        if (isTaskSucceeded(status, result) || extractResultUrl(result)) {
          updateResult(resultId, {
            finish: true,
            progress: result.progress ?? 100,
            src: extractResultUrl(result),
            completedAt: Date.now(),
          });
          return;
        }

        const retryable = !res.ok && (res.status === 404 || res.status >= 500);
        if (!res.ok && !retryable) {
          const message = errorMessage || `请求失败 (${res.status})`;
          updateResult(resultId, {
            finish: true,
            progress: 100,
            failureReason: message,
            error: message,
          });
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      }

      updateResult(resultId, {
        finish: true,
        progress: 100,
        error: "超时",
        failureReason: "超时",
      });
    } finally {
      updateSlot(slotId, { isGenerating: false });
    }
  };

  const canSendSlot = (slot) =>
    !!slot &&
    !slot.isGenerating &&
    (!!slot.prompt?.trim() || slot.urls.length > 0);

  const startGeneration = async (slot) => {
    const slotId = slot.id;
    const resultId = uuidv4();

    setResults((prev) => [
      {
        id: resultId,
        slotId,
        taskId: "",
        finish: false,
        progress: 0,
        src: "",
        failureReason: "",
        error: "",
        model: slot.model,
        invalidated: false,
      },
      ...prev,
    ]);

    try {
      const res = await fetch(`${config.ApiBaseUrl}/v1/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getAPIKEY(),
        },
        body: JSON.stringify(buildRequestData(slot)),
        cache: "no-store",
      });

      let data = {};
      try {
        data = unwrapTaskPayload(await res.json());
      } catch {
        data = {};
      }

      const status = getTaskStatus(data);
      const message = extractApiMessage(data, `请求失败 (${res.status})`);

      if (!res.ok || isTaskFailed(status)) {
        if (isAuthError(message, res.status)) {
          notifyError(
            "API Key 无效或已过期，请点击右上角「设置 API Key」重新填写。\n\n" +
              message,
          );
          removeResult(resultId);
        } else {
          const errorText =
            status === "violation"
              ? message || "提示词或图片内容违规，请修改后重试"
              : message;
          notifyError(errorText);
          updateResult(resultId, {
            finish: true,
            error: errorText,
          });
        }
        return;
      }

      if (isTaskSucceeded(status, data) && extractResultUrl(data)) {
        updateResult(resultId, {
          finish: true,
          progress: data.progress ?? 100,
          src: extractResultUrl(data),
          taskId: getTaskId(data),
          completedAt: Date.now(),
        });
        return;
      }

      const taskId = getTaskId(data);
      if (!taskId) {
        const missingId = message || "响应中未找到任务 id";
        notifyError(missingId, "响应中未找到任务 id");
        updateResult(resultId, {
          finish: true,
          error: missingId,
        });
        return;
      }

      updateResult(resultId, { taskId });
      await handleTask(resultId, taskId, slotId);
    } catch (error) {
      console.error("Error generating image:", error);
      updateResult(resultId, {
        finish: true,
        error: error.message || "生成失败",
      });
    } finally {
      updateSlot(slotId, { isGenerating: false });
    }
  };

  const generateForSlot = async (slotId) => {
    const slot = slotsRef.current.find((s) => s.id === slotId);
    if (!canSendSlot(slot)) return;

    if (!getAPIKEY()) {
      alert("请先设置 API Key");
      return;
    }

    updateSlot(slotId, { isGenerating: true });
    await startGeneration(slot);
  };

  const handleSendAll = () => {
    const sendable = slotsRef.current.filter(canSendSlot);

    if (sendable.length === 0) {
      alert("没有可发送的对话框（已在生成中或内容为空）");
      return;
    }

    if (!getAPIKEY()) {
      alert("请先设置 API Key");
      return;
    }

    const sendableIds = new Set(sendable.map((s) => s.id));
    setSlots((prev) =>
      prev.map((s) =>
        sendableIds.has(s.id) ? { ...s, isGenerating: true } : s,
      ),
    );

    sendable.forEach((slot) => {
      startGeneration(slot);
    });
  };

  const handleMasterPromptChange = (value) => {
    setMasterPrompt(value);
    setSlots((prev) => prev.map((slot) => ({ ...slot, prompt: value })));
  };

  const handleSlotChange = (slotId, nextSlot) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? nextSlot : slot)),
    );
  };

  const handleAddSlot = () => {
    setSlots((prev) => [...prev, createDefaultSlot(uuidv4())]);
  };

  const handleRemoveSlot = (slotId) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const clearAllResults = () => {
    if (results.length === 0) return;
    const confirmed = window.confirm(
      "确定要清空全部生成结果吗？\n\n此操作不可恢复，建议先批量下载需要保留的图片。",
    );
    if (confirmed) setResults([]);
  };

  const toggleResultInvalidated = (resultId) => {
    setResults((prev) => {
      const target = prev.find((r) => r.id === resultId);
      if (!target) return prev;

      const nextInvalidated = !target.invalidated;
      const updated = { ...target, invalidated: nextInvalidated };
      const others = prev.filter((r) => r.id !== resultId);
      const active = others.filter((r) => !r.invalidated);
      const inactive = others.filter((r) => r.invalidated);

      if (nextInvalidated) {
        return [...active, ...inactive, updated];
      }
      return [...active, updated, ...inactive];
    });
  };

  const handleEditResult = async (slotId, imageUrl) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;

    if (slot.urls.length >= 8) {
      alert("最多只能上传 8 张参考图");
      return;
    }

    let reference = imageUrl;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      reference = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      // fallback to URL if fetch fails
    }

    handleSlotChange(slotId, {
      ...slot,
      urls: [...slot.urls, reference],
    });
  };

  useEffect(() => {
    let nextSlots = [createDefaultSlot(uuidv4())];
    let nextResults = [];
    let nextMaster = "";

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.slots?.length) {
          nextSlots = parsed.slots.map((slot) => ({
            ...createDefaultSlot(slot.id),
            ...slot,
            model: normalizeModel(slot.model),
            urls: (slot.urls || []).filter(isStorableUrl),
            isGenerating: false,
          }));
        }
        if (parsed.results) nextResults = normalizeStoredResults(parsed.results);
        if (parsed.masterPrompt) nextMaster = parsed.masterPrompt;
      }
    } catch (error) {
      console.error("Failed to load saved data:", error);
      localStorage.removeItem(STORAGE_KEY);
    }

    const promptFromUrl = initialPrompt?.trim();
    const modelFromUrl = initialModel?.trim();
    if (promptFromUrl || modelFromUrl) {
      const model = normalizeModel(modelFromUrl || nextSlots[0]?.model);
      nextSlots = nextSlots.map((slot, index) => {
        let next = applyModelChange(slot, model);
        if (promptFromUrl && index === 0) {
          next = { ...next, prompt: promptFromUrl };
        }
        return next;
      });
      if (promptFromUrl) nextMaster = promptFromUrl;
    }

    setSlots(nextSlots);
    setResults(nextResults);
    setMasterPrompt(nextMaster);
  }, [initialPrompt, initialModel]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveToStorage({
        slots: serializeSlots(slots),
        results: serializeResults(results),
        masterPrompt,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [slots, results, masterPrompt]);

  return (
    <div className="relative z-10 mx-auto">
      <div className="mb-5">
        <h1 className="img-pricing-page__title" style={{ marginBottom: 6 }}>
          批量生图
        </h1>
        <p className="img-pricing-page__sub" style={{ marginBottom: 0 }}>
          多提示词并行出图，结果可批量下载。请先在右上角设置 API Key。
        </p>
      </div>
      <div className="flex min-h-[calc(100vh-200px)] flex-col gap-4 lg:flex-row">
        <div className="img-batch-panel flex min-h-[500px] w-full flex-1 flex-col p-4 lg:w-1/2">
          <PromptListPanel
            slots={slots}
            masterPrompt={masterPrompt}
            onMasterPromptChange={handleMasterPromptChange}
            onSlotChange={handleSlotChange}
            onAddSlot={handleAddSlot}
            onRemoveSlot={handleRemoveSlot}
            onSendSlot={generateForSlot}
            onSendAll={handleSendAll}
          />
        </div>

        <div className="img-batch-panel flex min-h-[500px] w-full flex-1 flex-col p-4 lg:w-1/2">
          <ResultsPanel
            results={results}
            onEdit={handleEditResult}
            onToggleInvalidated={toggleResultInvalidated}
            onClearAll={clearAllResults}
          />
        </div>
      </div>
    </div>
  );
};

export default GenerateSection;
