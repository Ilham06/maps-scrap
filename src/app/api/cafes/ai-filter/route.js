import { NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { addDistanceToCafes } from "@/lib/geo";
import { getCityData } from "@/lib/constants";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  const body = await request.json();
  const { city, query, lat, lng } = body;

  if (!city || !query) {
    return NextResponse.json(
      { error: "city and query are required" },
      { status: 400 }
    );
  }

  const cityData = getCityData(city.toLowerCase());

  let cafes = await prisma.cafe.findMany({
    where: { city: city.toLowerCase() },
  });

  if (cafes.length === 0) {
    return NextResponse.json({
      cafes: [],
      aiMessage: `Belum ada data cafe di ${cityData.label}. Coba refresh data dulu.`,
    });
  }

  const hasLocation = lat != null && lng != null;
  if (hasLocation) {
    cafes = addDistanceToCafes(cafes, lat, lng);
  }

  const cafeSummaries = cafes.map((c) => ({
    id: c.id,
    name: c.name,
    rating: c.rating,
    reviews: c.reviewCount,
    wfc: c.wfcScore,
    vibe: c.vibeDescription,
    mood: c.moodTags,
    highlight: c.highlightFeature,
    warning: c.warningFlag,
    address: c.address,
    distance: c.distanceKm ?? null,
  }));

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const prompt = `Kamu adalah WFC Cafe Finder AI — asisten pencari cafe untuk remote workers di Indonesia.

User sedang mencari cafe di ${cityData.label} dan bilang:
"${query}"

Berikut daftar cafe yang tersedia (format JSON):
${JSON.stringify(cafeSummaries)}

Tugas kamu:
1. Filter dan ranking cafe yang paling cocok dengan keinginan user
2. Berikan alasan singkat per cafe kenapa cocok (1 kalimat, bahasa gaul Indonesia)
3. Berikan pesan pembuka yang engaging ke user (1-2 kalimat)

Response dalam JSON format:
{
  "message": "<pesan ke user, friendly dan relatable>",
  "results": [
    {
      "id": <cafe id>,
      "reason": "<kenapa cafe ini cocok dengan request user>"
    }
  ]
}

Rules:
- Maksimal 10 cafe dalam results
- Ranking dari yang paling cocok
- Kalau user sebut "dekat" atau "terdekat", prioritaskan yang distance-nya kecil
- Kalau tidak ada yang cocok, kembalikan results kosong dengan message yang helpful
- Reason harus spesifik ke request user, bukan generic`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.7,
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);
    const rankedIds = (aiResult.results || []).map((r) => r.id);
    const reasonMap = Object.fromEntries(
      (aiResult.results || []).map((r) => [r.id, r.reason])
    );

    const rankedCafes = rankedIds
      .map((id) => cafes.find((c) => c.id === id))
      .filter(Boolean)
      .map((cafe) => ({
        ...cafe,
        moodTags: cafe.moodTags ? JSON.parse(cafe.moodTags) : [],
        distanceKm: cafe.distanceKm ?? null,
        aiReason: reasonMap[cafe.id] || null,
      }));

    return NextResponse.json({
      cafes: rankedCafes,
      aiMessage: aiResult.message || "",
      query,
    });
  } catch (error) {
    console.error("AI filter failed:", error.message);
    return NextResponse.json(
      { error: "AI filter gagal. Coba lagi." },
      { status: 500 }
    );
  }
}
