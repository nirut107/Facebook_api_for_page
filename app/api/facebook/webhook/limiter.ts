import { kv } from "@vercel/kv";

/* ======================
   Key builders
====================== */
export const kvKey = {
  comment: (commentId: string) =>
    `comment:${commentId}`,

  userPostDay: (userId: string, postId: string, day: string) =>
    `user:${userId}:post:${postId}:day:${day}`,

  pageDay: (pageId: string, day: string) =>
    `page:${pageId}:day:${day}`,
};

/* ======================
   Time helpers
====================== */
export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

/* ======================
   Comment-level (anti retry)
====================== */
export async function isCommentProcessed(commentId: string) {
  return Boolean(await kv.get(kvKey.comment(commentId)));
}

export async function markCommentProcessed(
  commentId: string,
  ttlSeconds = 60 * 60 * 24 // 1 day
) {
  await kv.set(kvKey.comment(commentId), "1", { ex: ttlSeconds });
}

/* ======================
   User / Post / Day limiter
====================== */
export async function hasUserUsedPostToday(
  userId: string,
  postId: string,
  day = getTodayKey()
) {
  return Boolean(await kv.get(kvKey.userPostDay(userId, postId, day)));
}

export async function markUserUsedPostToday(
  userId: string,
  postId: string,
  day = getTodayKey(),
  ttlSeconds = 60 * 60 * 24 // 24h
) {
  await kv.set(
    kvKey.userPostDay(userId, postId, day),
    "1",
    { ex: ttlSeconds }
  );
}

/* ======================
   Page-level daily quota (optional)
====================== */
export async function getPageUsageToday(
  pageId: string,
  day = getTodayKey()
): Promise<number> {
  const val = await kv.get<number>(kvKey.pageDay(pageId, day));
  return Number(val || 0);
}

export async function incrementPageUsageToday(
  pageId: string,
  day = getTodayKey(),
  ttlSeconds = 60 * 60 * 24
): Promise<number> {
  const key = kvKey.pageDay(pageId, day);
  const current = Number((await kv.get<number>(key)) || 0) + 1;
  await kv.set(key, current, { ex: ttlSeconds });
  return current;
}
