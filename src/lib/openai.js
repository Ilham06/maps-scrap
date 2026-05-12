import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyzeCafe(cafe) {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const prompt = `Kamu adalah ahli cafe dan remote working di Indonesia.

Analisis cafe berikut dan berikan penilaian untuk WFC (Work From Cafe):

Nama: ${cafe.name}
Kota: ${cafe.city}
Rating: ${cafe.rating || "tidak diketahui"}
Jumlah Review: ${cafe.reviewCount || "tidak diketahui"}
Alamat: ${cafe.address || "tidak diketahui"}

Berikan response dalam JSON format:
{
  "wfcScore": <number 0-100, seberapa cocok untuk WFC>,
  "vibeDescription": "<1-2 kalimat deskripsi vibe cafe dalam Bahasa Indonesia, kreatif dan engaging>",
  "moodTags": [<1-3 tag dari: "Fokus", "Santai", "Social", "Aesthetic", "Sepi", "Ramai", "Cozy", "Industrial">],
  "highlightFeature": "<satu hal paling unik dari cafe ini>",
  "warningFlag": "<hal yang perlu diperhatiin, atau null jika tidak ada>"
}

Estimasi berdasarkan nama, lokasi, dan data yang ada. Buat deskripsi yang menarik dan relatable untuk anak muda Indonesia.`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 400,
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return {
      wfcScore: Math.min(100, Math.max(0, result.wfcScore || 50)),
      vibeDescription: result.vibeDescription || "",
      moodTags: JSON.stringify(result.moodTags || ["Santai"]),
      highlightFeature: result.highlightFeature || "",
      warningFlag: result.warningFlag || null,
    };
  } catch (error) {
    console.error(`Failed to analyze cafe ${cafe.name}:`, error.message);
    return null;
  }
}

export async function analyzeCafeBatch(cafes, maxPerBatch = 10) {
  const toAnalyze = cafes.slice(0, maxPerBatch);
  const results = [];

  for (const cafe of toAnalyze) {
    const analysis = await analyzeCafe(cafe);
    if (analysis) {
      results.push({ id: cafe.id, ...analysis });
    }
    await delay(500);
  }

  return results;
}
