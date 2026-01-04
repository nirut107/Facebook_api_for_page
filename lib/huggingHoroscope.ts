import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_KEY);
const MODEL = "bigscience/bloomz-560m";

export async function hfHoroscopeSafe(
  birthDate: string,
  weekday: string
): Promise<string | null> {
  try {
    const prompt = `คุณคือหมอดูไทย พูดจาสุภาพ เป็นกันเอง

ผู้ใช้เกิดวันที่ ${birthDate} (${weekday})

ทำนายดวงแบบ:
- ภาษาไทย
- อบอุ่น ให้กำลังใจ
- ไม่ทำนายร้ายแรง
- ความยาว 2–3 ประโยค
- โฟกัส ภาพรวมชีวิต การงาน การเงิน

ห้ามใช้คำว่า AI
`;

    const res = await hf.textGeneration({
      model: MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 120,
        temperature: 0.8,
      },
    });

    return res.generated_text || null;

  } catch (err: any) {
    console.error("HF ERROR:", err?.message || err);
    return null; // 👈 สำคัญมาก
  }
}
