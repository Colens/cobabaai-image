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
    localStorage.setItem("apikey", apiKey);
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
        <Button variant="outline" className="border-violet-300/50 hover:bg-violet-500/10 hover:border-violet-400">
          获取 API Key
        </Button>
      </Link>

      <Dialog open={open} onOpenChange={SetOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20">
            设置 API Key
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md border-violet-500/20 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>设置 CobabaAI API Key</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入您的 CobabaAI API Key"
              className="w-full border-violet-500/30 focus-visible:ring-violet-500/50"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => SetOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSaveApiKey}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeyButtons;
