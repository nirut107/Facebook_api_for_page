import { NextRequest, NextResponse } from "next/server";
import { getThaiWeekday } from "@/lib/horoscope";
import { getRandomFortune } from "@/lib/fortune";

const OUT_OF_QUOTA_MESSAGE = "🙏 วันนี้พ่อหมอพักแล้ว มาพรุ่งนี้ใหม่นะครับ";



import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("=== FACEBOOK VERIFY ===");
  console.log("mode:", mode);
  console.log("verify_token:", token);
  console.log("challenge:", challenge);
  console.log("env VERIFY_TOKEN:", process.env.VERIFY_TOKEN);

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}



export async function POST(req: NextRequest) {
  const body = await req.json();
  const value = body?.entry?.[0]?.changes?.[0]?.value;

  if (!value?.comment_id) return NextResponse.json({ ok: true });
  if (value.post_id !== process.env.TARGET_POST_ID)
    return NextResponse.json({ ignored: true });

  const birthText = value.message;
  const weekday = getThaiWeekday(birthText);

  if (!weekday) {
    await reply(value.comment_id, "❌ กรุณาพิมพ์วันเกิด เช่น 12/03/1998");
    return NextResponse.json({ ok: true });
  }

  // 👇 เรียก AI แบบ safe
  const fortune = await getRandomFortune();

  if (!fortune) {
    // 🔴 quota หมด / error
    await reply(value.comment_id, OUT_OF_QUOTA_MESSAGE);
    return NextResponse.json({ quota: "exceeded" });
  }

  await reply(value.comment_id, `🎂 คุณเกิด${weekday}\n🔮 ${fortune}`);

  return NextResponse.json({ ok: true });
}

async function reply(commentId: string, message: string) {
  if (!process.env.PAGE_TOKEN) return;

  await fetch(`https://graph.facebook.com/v19.0/${commentId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      access_token: process.env.PAGE_TOKEN,
    }),
  });
}
