import { getRandomFortune } from "./action/fortune";
type PostTodo = (commentId: string) => Promise<void>;

export function getPostAction(postId: string) {
  return POST_CONFIG[postId] || null;
}

export type PostAction = "FORTUNE";

export const POST_CONFIG: Record<
  string,
  {
    action: PostAction;
    triggerText: string;
    havesent: string;
    todo: PostTodo;
  }
> = {
  "898138396724948_122094158751206345": {
    action: "FORTUNE",
    triggerText: "ทำนายให้ข้าเถิด",
    havesent: "🔮 วันนี้พ่อหมอทำนายให้แล้ว พรุ่งนี้มาใหม่นะ",
    todo: getRandomFortune,
  },
};
