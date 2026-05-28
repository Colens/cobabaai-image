"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import config from "@/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

const ApiKeyButtons = () => {
  const [apiKey, setApiKey] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const savedApiKey = localStorage.getItem("apikey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      alert("API Key 不能为空");
      return;
    }
    localStorage.setItem("apikey", trimmed);
    setApiKey(trimmed);
    setOpen(false);
  };

  const SetOpen = (status) => {
    const savedApiKey = localStorage.getItem("apikey");
    setApiKey(savedApiKey || "");
    setOpen(status);
  };

  return (
    <div className="flex gap-2">
      <Link href={config.ApiKeyUrl} target="_blank">
        <Button variant="outline">获取 API Key</Button>
      </Link>

      <Dialog open={open} onOpenChange={SetOpen}>
        <DialogTrigger asChild>
          <Button>设置 API Key</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md border-border bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>设置 CobabaAi API Key</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入您的 CobabaAi API Key"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => SetOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveApiKey}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeyButtons;
