import { NextRequest, NextResponse } from "next/server";
import { pollinations } from "@/lib/pollinations";

export async function POST(req: NextRequest) {
  try {
    const { keywords } = await req.json();

    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json({ error: "Missing or invalid keywords" }, { status: 400 });
    }

    const clusters = await pollinations.clusterKeywords(keywords);
    return NextResponse.json(clusters);
  } catch (error: any) {
    console.error("AI Clustering API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
