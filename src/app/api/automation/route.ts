import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { pollinations } from "@/lib/pollinations";
import { blogger } from "@/lib/blogger";
import * as admin from "firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get active automations that are due for a run
    const now = admin.firestore.Timestamp.now();
    const automationsSnapshot = await adminDb
      .collection("automations")
      .where("status", "==", "active")
      .where("nextRun", "<=", now)
      .limit(1) // Process one at a time to avoid timeouts
      .get();

    if (automationsSnapshot.empty) {
      return NextResponse.json({ message: "No automations to run" });
    }

    const autoDoc = automationsSnapshot.docs[0];
    const autoData = autoDoc.data();
    const blogDoc = await adminDb.collection("blogs").doc(autoData.blogId).get();
    
    if (!blogDoc.exists) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    const blogData = blogDoc.data()!;

    // 2. Perform Workflow:
    // a. Find an unused keyword for this blog
    const keywordSnapshot = await adminDb
      .collection("keywords")
      .where("blogId", "==", autoData.blogId)
      .where("status", "==", "unused")
      .limit(1)
      .get();

    let keywordData: { id: string; [key: string]: string };
    if (keywordSnapshot.empty) {
      // b. If no keywords, generate new ones
      const researchPrompt = `Generate 5 SEO keywords for a blog in the niche "${blogData.niche}". Return as a comma separated list.`;
      const keywordsStr = await pollinations.generateText(researchPrompt);
      const newKeywords = keywordsStr.split(",").map((k: string) => k.trim()).filter((k: string) => k);
      
      for (const kw of newKeywords) {
        await adminDb.collection("keywords").add({
          keyword: kw,
          blogId: autoData.blogId,
          userId: autoData.userId,
          status: "unused",
          niche: blogData.niche,
          search_volume: Math.floor(Math.random() * 5000) + 100,
          difficulty: Math.floor(Math.random() * 100),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      
      // Pick the first one we just added
      keywordData = { keyword: newKeywords[0], id: "temp", niche: blogData.niche };
    } else {
      keywordData = { id: keywordSnapshot.docs[0].id, ...keywordSnapshot.docs[0].data() };
    }

    // c. Generate Article
    const article = await pollinations.generateArticle(keywordData.keyword, keywordData.niche);
    
    // d. Generate Image
    const imageUrl = await pollinations.generateImage(`${keywordData.keyword} in ${keywordData.niche} niche professional photography`);

    // e. Publish to Blogger
    const fullContent = `
      <img src="${imageUrl}" alt="${article.title}" style="width:100%; height:auto; border-radius:8px; margin-bottom:20px;" />
      ${article.content}
      <br><br>
      <p><em>${article.metaDescription}</em></p>
    `;
    await blogger.publishToBlogger(blogData.bloggerEmail, article.title, fullContent, [keywordData.niche]);

    // f. Update Keyword Status
    if (keywordData.id !== "temp") {
      await adminDb.collection("keywords").doc(keywordData.id).update({
        status: "published",
        publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // g. Update Automation: nextRun = now + (24h / postsPerDay)
    const intervalMs = (24 * 60 * 60 * 1000) / autoData.postsPerDay;
    const nextRun = admin.firestore.Timestamp.fromMillis(Date.now() + intervalMs);
    
    await autoDoc.ref.update({
      lastRun: admin.firestore.FieldValue.serverTimestamp(),
      nextRun: nextRun,
    });

    // h. Log activity
    await adminDb.collection("activity").add({
      userId: autoData.userId,
      action: "Automated Publication",
      target: article.title,
      blogName: blogData.name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, article: article.title });

  } catch (error) {
    console.error("Automation Workflow Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
