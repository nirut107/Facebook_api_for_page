import { NextRequest, NextResponse } from "next/server";
import { getPostAction } from "./postConfig";
import { reply } from "@/lib/facebookReply";
import {
  isCommentProcessed,
  markCommentProcessed,
  hasUserUsedPostToday,
  markUserUsedPostToday,
} from "./limiter";

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
  if (!value?.comment_id) return ok();

  const postId = value.post_id;
  const userId = value.from?.id;
  const commentId = value.comment_id;
  const pageId = process.env.PAGE_ID!;

  // 1️⃣ กันลูป: ไม่ตอบ comment จากเพจ
  if (value.from?.id === pageId) return ok();

  // 2️⃣ กัน webhook ซ้ำ
  if (await isCommentProcessed(commentId)) return ok();

  console.log(value.post_id);
  // 3️⃣ ตรวจ post config
  const config = getPostAction(postId);
  if (!config) return ok();

  // 4️⃣ ตรวจ trigger text
  const text = (value.message || "").trim();
  if (config.triggerText && text !== config.triggerText) return ok();

  if (await hasUserUsedPostToday(userId, postId)) {
    await reply(commentId, config.havesent);
    await markCommentProcessed(commentId);
    return ok();
  }

  //  ตอบจริง
  await config.todo(commentId);

  // บันทึก state
  await markCommentProcessed(commentId);
  await markUserUsedPostToday(userId, postId);
  return ok();
}

const ok = () => NextResponse.json({ ok: true });
