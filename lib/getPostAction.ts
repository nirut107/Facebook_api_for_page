import { POST_CONFIG } from "./postConfig";

export function getPostAction(postId: string) {
  return POST_CONFIG[postId] || null;
}
