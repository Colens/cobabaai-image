// 生成图像（CobabaAi 统一 JSON 出图）
async function onGenerate() {
  try {
    const res = await fetch("https://cobabaai.com/v1/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer sk-xxxxx",
      },
      body: JSON.stringify({
        model: drawData.model,
        prompt: drawData.prompt,
        images: drawData.urls || [],
        aspectRatio: drawData.size || "auto",
        replyType: "async",
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    const taskId = data.id;
    if (!taskId) {
      console.log("Received data:", data);
      return;
    }

    const resultRes = await fetch(
      `https://cobabaai.com/v1/api/result?id=${encodeURIComponent(taskId)}`,
      {
        headers: {
          Authorization: "Bearer sk-xxxxx",
        },
        cache: "no-store",
      },
    );
    const result = await resultRes.json();
    console.log("Task result:", result);
  } catch (error) {
    console.error("Error generating image:", error);
  }
}
