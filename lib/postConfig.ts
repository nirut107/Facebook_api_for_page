export type PostAction = "FORTUNE";

export const POST_CONFIG: Record<
  string,
  {
    action: PostAction;
    triggerText?: string;
  }
> = {
  "1234567890_1111111111": {
    action: "FORTUNE",
    triggerText: "ทำนายให้ข้าเถิด",
  },
};
