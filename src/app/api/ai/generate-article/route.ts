import { NextRequest, NextResponse } from "next/server";
import { pollinations } from "@/lib/pollinations";

export async function POST(req: NextRequest) {
  try {
    const { keyword, niche, language } = await req.json();

    if (!keyword || !niche) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const article = await pollinations.generateArticle(keyword, niche, language);
    const imageUrl = await pollinations.generateImage(`${keyword} in ${niche} niche professional photography`);

    return NextResponse.json({ article, imageUrl });
  } catch (error: any) {
    console.error("AI Generation API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
