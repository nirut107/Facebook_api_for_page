import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import { getRandomFortune } from "@/app/api/facebook/webhook/action/fortune";

const hf = new HfInference(process.env.HF_API_KEY);

export async function GET() {
  const prompt = `
คุณคือหมอดูไทย พูดจาสุภาพ เป็นกันเอง
ผู้ใช้เกิดวันที่ 14/02/1995 (วันอังคาร)
ทำนายดวงสั้นๆ 2–3 ประโยค
เน้นภาพรวมชีวิต การงาน การเงิน
`;

  try {
    const message = `🔮 ${getRandomFortune()}`;
    return NextResponse.json({
      ok: true,
      content: message,
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e?.message || "AI error",
    });
  }
}
