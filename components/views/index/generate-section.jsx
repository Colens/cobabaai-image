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
            webHook: "-1",
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

  const parseApiError = async (res) => {
    try {
      const data = await res.json();
      return (
        data?.msg ||
        data?.error?.message ||
        data?.message ||
        `请求失败 (${res.status})`
      );
    } catch {
      return `请求失败 (${res.status})`;
    }
  };

  const getAPIEndpoint = (model) => {
    const baseUrl = config.ApiBaseUrl;
    const endpointMap = {
      "gpt-image-2": `${baseUrl}/v1/draw/completions`,
      "nano-banana-fast": `${baseUrl}/v1/draw/nano-banana`,
      "nano-banana-pro": `${baseUrl}/v1/draw/nano-banana`,
      "nano-banana-pro-vt": `${baseUrl}/v1/draw/nano-banana`,
      "nano-banana-pro-cl": `${baseUrl}/v1/draw/nano-banana`,
      "nano-banana-pro-vip": `${baseUrl}/v1/draw/nano-banana`,
      "nano-banana-pro-4k-vip": `${baseUrl}/v1/draw/nano-banana`,
      "nano-banana-2": `${baseUrl}/v1/draw/nano-banana`,
      "nano-banana-2-cl": `${baseUrl}/v1/draw/nano-banana`,
      "nano-banana-2-4k-cl": `${baseUrl}/v1/draw/nano-banana`,
    };
    return endpointMap[model] || `${baseUrl}/v1/draw/completions`;
  };

  const buildRequestData = (slot) => {
    const requestData = {
      prompt: slot.prompt,
      variants: slot.variants,
      model: slot.model,
      urls: slot.urls,
      webHook: slot.webHook,
      aspectRatio: slot.size,
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

    try {
      while (true) {
        const res = await fetch(`${baseUrl}/v1/draw/result`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + getAPIKEY(),
          },
          body: JSON.stringify({ id: taskId }),
        });
        const result = await res.json();

        if (result.code === -22) {
          updateResult(resultId, {
            finish: true,
            progress: 100,
            error: "超时",
            failureReason: "超时",
          });
          break;
        }

        if (result.code !== 0) {
          alert(result.msg);
          break;
        }

        const data = result.data;

        if (data.status === "running") {
          updateResult(resultId, {
            finish: false,
            progress: data.progress,
          });
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }

        if (data.status === "succeeded") {
          let resultUrl = "";
          if (data.results?.length > 0) {
            resultUrl = data.results[0].url;
          } else if (data.url) {
            resultUrl = data.url;
          }

          updateResult(resultId, {
            finish: true,
            progress: data.progress,
            src: resultUrl,
            completedAt: Date.now(),
          });
          break;
        }

        if (data.status === "failed") {
          updateResult(resultId, {
            finish: true,
            progress: 100,
            failureReason: data.failure_reason,
            error: data.error,
          });
          break;
        }
      }
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
      const res = await fetch(getAPIEndpoint(slot.model), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getAPIKEY(),
        },
        body: JSON.stringify(buildRequestData(slot)),
        cache: "no-store",
      });

      if (!res.ok) {
        const message = await parseApiError(res);
        if (isAuthError(message, res.status)) {
          alert(
            "API Key 无效或已过期，请点击右上角「设置 API Key」重新填写。\n\n" +
              message,
          );
          removeResult(resultId);
        } else {
          alert(message);
          updateResult(resultId, {
            finish: true,
            error: message,
          });
        }
        return;
      }

      const data = await res.json();
      if (data.code !== 0) {
        if (isAuthError(data.msg)) {
          alert(
            "API Key 无效或已过期，请点击右上角「设置 API Key」重新填写。\n\n" +
              data.msg,
          );
          removeResult(resultId);
        } else {
          alert(data.msg);
          updateResult(resultId, {
            finish: true,
            error: data.msg,
          });
        }
        return;
      }

      const taskId = data.data.id;
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
