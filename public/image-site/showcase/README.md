# Ideogram 首页图片同步

1. 在已通过人机验证的 Chrome 打开 https://ideogram.ai/
2. 向下滚动加载更多作品
3. 打开 DevTools → Console，粘贴并运行 `web/scripts/export-ideogram-urls.js` 的内容
4. 将输出的 URL 保存到本目录的 `ideogram-urls.txt`（每行一个）
5. 执行：

```bash
cd web
bun run scripts/download-showcase.mjs
```

图片会下载到 `images/`，并生成 `manifest.json` 供首页瀑布流展示。

> 请仅用于站内展示参考；Ideogram 图片受版权保护，正式商用请替换为自有或已授权素材。
