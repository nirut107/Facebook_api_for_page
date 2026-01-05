import { redis } from "./redis";

/* ======================
   Key builders
====================== */
export const kvKey = {
  comment: (commentId: string) => `comment:${commentId}`,
  userPostDay: (userId: string, postId: string, day: string) =>
    `user:${userId}:post:${postId}:day:${day}`,
  pageDay: (pageId: string, day: string) =>
    `page:${pageId}:day:${day}`,
};

export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

/* ======================
   Comment-level
====================== */
export async function isCommentProcessed(commentId: string) {
  return (await redis.get(kvKey.comment(commentId))) !== null;
}

export async function markCommentProcessed(
  commentId: string,
  ttl = 86400
) {
  await redis.set(kvKey.comment(commentId), "1", "EX", ttl);
}

/* ======================
   User / Post / Day
====================== */
export async function hasUserUsedPostToday(
  userId: string,
  postId: string,
  day = getTodayKey()
) {
  return (
    (await redis.get(kvKey.userPostDay(userId, postId, day))) !==
    null
  );
}

export async function markUserUsedPostToday(
  userId: string,
  postId: string,
  day = getTodayKey(),
  ttl = 86400
) {
  await redis.set(
    kvKey.userPostDay(userId, postId, day),
    "1",
    "EX",
    ttl
  );
}

/* ======================
   Page daily quota (optional)
====================== */
export async function incrementPageUsageToday(
  pageId: string,
  day = getTodayKey(),
  ttl = 86400
) {
  const key = kvKey.pageDay(pageId, day);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, ttl);
  }
  return count;
}
