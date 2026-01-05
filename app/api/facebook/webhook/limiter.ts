import { getRedis } from "./redis";

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
   Comment-level (anti retry)
====================== */
export async function isCommentProcessed(commentId: string) {
  const redis = await getRedis();
  return (await redis.get(kvKey.comment(commentId))) !== null;
}

export async function markCommentProcessed(
  commentId: string,
  ttl = 86400
) {
  const redis = await getRedis();
  await redis.set(kvKey.comment(commentId), "1", {
    EX: ttl,
  });
}

/* ======================
   User / Post / Day limiter
====================== */
export async function hasUserUsedPostToday(
  userId: string,
  postId: string,
  day = getTodayKey()
) {
  const redis = await getRedis();
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
  const redis = await getRedis();
  await redis.set(
    kvKey.userPostDay(userId, postId, day),
    "1",
    { EX: ttl }
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
  const redis = await getRedis();
  const key = kvKey.pageDay(pageId, day);

  const count = await redis.incr(key);

  // ตั้ง TTL เฉพาะครั้งแรก
  if (count === 1) {
    await redis.expire(key, ttl);
  }

  return count;
}
