import { NextRequest, NextResponse } from "next/server";
import { blogger } from "@/lib/blogger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { bloggerEmail, title, content, labels } = await req.json();

    if (!bloggerEmail || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await blogger.publishToBlogger(bloggerEmail, title, content, labels);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Publish API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
