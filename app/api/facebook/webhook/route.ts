

import { getRandomFortune } from "@/lib/fortune";
import { NextRequest, NextResponse } from "next/server";
import { getPostAction } from "@/lib/getPostAction";
import { reply } from "@/lib/facebookReply";


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
  console.log("🔥 PAGE FEED WEBHOOK HIT");
  const body = await req.json();
  const value = body?.entry?.[0]?.changes?.[0]?.value;

  if (!value?.comment_id) return NextResponse.json({ ok: true });

  console.log(value.post_id)
  const config = getPostAction(value.post_id);
  if (!config) {
    return NextResponse.json({ ignored: "post_not_configured" });
  }

  const text = (value.message || "").trim();

  if (
    config.action === "FORTUNE" &&
    text === config.triggerText
  ) {
    const fortune = getRandomFortune();
    await reply(
      value.comment_id,
      `🔮 คำทำนายของคุณ\n${fortune}`
    );
  }


  return NextResponse.json({ ok: true });
}