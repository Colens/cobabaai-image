"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PromptItem from "./prompt-item";
import { Plus, SendHorizontal } from "lucide-react";

const PromptListPanel = ({
  slots,
  masterPrompt,
  onMasterPromptChange,
  onSlotChange,
  onAddSlot,
  onRemoveSlot,
  onSendSlot,
  onSendAll,
}) => {
  const masterRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [masterEditable, setMasterEditable] = useState(false);

  const canSendSlot = (slot) =>
    !slot.isGenerating && (!!slot.prompt?.trim() || slot.urls.length > 0);

  const hasSendableSlot = slots.some(canSendSlot);

  const handleMasterFocus = () => {
    if (!masterEditable) {
      setConfirmOpen(true);
    }
  };

  const handleConfirmMaster = () => {
    setMasterEditable(true);
    setConfirmOpen(false);
    setTimeout(() => masterRef.current?.focus(), 0);
  };

  const handleCancelMaster = () => {
    setConfirmOpen(false);
    masterRef.current?.blur();
  };

  const handleMasterChange = (value) => {
    onMasterPromptChange(value);
  };

  const handleMasterBlur = () => {
    setMasterEditable(false);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">提示词列表</h2>
        <Button variant="outline" size="sm" onClick={onAddSlot} className="h-8 gap-1">
          <Plus className="h-3.5 w-3.5" />
          添加对话框
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
        {slots.map((slot, index) => (
          <PromptItem
            key={slot.id}
            index={index}
            slot={slot}
            canRemove={slots.length > 1}
            onChange={(next) => onSlotChange(slot.id, next)}
            onSend={() => onSendSlot(slot.id)}
            onRemove={() => onRemoveSlot(slot.id)}
          />
        ))}
      </div>

      <div className="shrink-0 rounded-2xl border border-border bg-accent p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold text-accent-foreground">
            总对话框
          </span>
          <span className="text-xs text-muted-foreground">
            输入后同步到所有列表项
          </span>
        </div>
        <div className="flex gap-2">
          <Textarea
            ref={masterRef}
            value={masterPrompt}
            readOnly={!masterEditable}
            onFocus={handleMasterFocus}
            onBlur={handleMasterBlur}
            onChange={(e) => handleMasterChange(e.target.value)}
            placeholder="点击输入，将同步到所有对话框..."
            className={`min-h-[64px] flex-1 resize-none rounded-xl border-border bg-background text-sm ${
              !masterEditable ? "cursor-pointer opacity-80" : ""
            }`}
            rows={2}
          />
          <Button
            type="button"
            onClick={onSendAll}
            disabled={!hasSendableSlot}
            className="h-auto shrink-0 gap-1.5 self-stretch rounded-xl px-4"
          >
            <SendHorizontal className="h-4 w-4" />
            全部发送
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              确认在总对话框输入？
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed text-foreground/90">
              在总对话框中输入的内容将同步填写到所有列表项。
              <br />
              是否继续？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelMaster}>
              取消
            </Button>
            <Button onClick={handleConfirmMaster}>确认输入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptListPanel;
