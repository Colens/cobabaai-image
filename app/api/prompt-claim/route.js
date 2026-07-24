import { NextResponse } from "next/server";
import {
  lookupPromptByClaimCode,
  normalizeClaimCode,
} from "@/lib/strykef-prompts";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const CLAIM_CODE_RE = /^[A-Z0-9]{8,16}$/;

export async function POST(request) {
  const ip = getClientIp(request);
  const limited = checkRateLimit(`prompt-claim:${ip}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: `请求过于频繁，请 ${limited.retryAfterSec} 秒后再试` },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式无效" }, { status: 400 });
  }

  const claimCode = normalizeClaimCode(body?.claimCode ?? body?.code);
  if (!claimCode) {
    return NextResponse.json({ error: "请输入领取码" }, { status: 400 });
  }

  if (!CLAIM_CODE_RE.test(claimCode)) {
    return NextResponse.json({ error: "领取码格式不正确" }, { status: 400 });
  }

  try {
    const prompt = lookupPromptByClaimCode(claimCode);
    if (prompt == null || prompt === "") {
      return NextResponse.json({ error: "领取码无效" }, { status: 404 });
    }
    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("[prompt-claim]", error);
    return NextResponse.json({ error: "服务暂不可用" }, { status: 500 });
  }
}
