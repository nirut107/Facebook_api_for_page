export async function reply(
    commentId: string,
    message: string
  ) {
    if (!process.env.PAGE_TOKEN) return;
  
    await fetch(
      `https://graph.facebook.com/v19.0/${commentId}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          access_token: process.env.PAGE_TOKEN,
        }),
      }
    );
  }
  