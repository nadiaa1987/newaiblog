"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  FileText, 
  Image as ImageIcon, 
  Send, 
  Search, 
  CheckCircle, 
  Loader2, 
  Eye, 
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface Keyword {
  id: string;
  keyword: string;
  blogId: string;
  niche: string;
  status: string;
}

interface Blog {
  id: string;
  name: string;
  bloggerEmail: string;
}

export default function ArticleGeneratorPage() {
  const { user } = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedKeywordId, setSelectedKeywordId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  const [generatedArticle, setGeneratedArticle] = useState<{
    title: string;
    content: string;
    metaDescription: string;
    imageUrl?: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const kQuery = query(collection(db, "keywords"), where("userId", "==", user.uid), where("status", "==", "unused"));
    const unsubscribeK = onSnapshot(kQuery, (snapshot) => {
      setKeywords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Keyword)));
    });

    const bQuery = query(collection(db, "blogs"), where("userId", "==", user.uid));
    const unsubscribeB = onSnapshot(bQuery, (snapshot) => {
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog)));
    });

    return () => {
      unsubscribeK();
      unsubscribeB();
    };
  }, [user]);

  const handleGenerate = async () => {
    if (!selectedKeywordId) return;
    const keyword = keywords.find(k => k.id === selectedKeywordId);
    if (!keyword) return;

    setGenerating(true);
    try {
      const response = await axios.post("/api/ai/generate-article", {
        keyword: keyword.keyword,
        niche: keyword.niche
      });
      
      const { article, imageUrl } = response.data;
      
      setGeneratedArticle({
        title: article.title,
        content: article.content,
        metaDescription: article.metaDescription,
        imageUrl: imageUrl
      });
    } catch (error) {
      console.error("Generation Error:", error);
      alert("Failed to generate article.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedArticle || !selectedKeywordId) return;
    const keyword = keywords.find(k => k.id === selectedKeywordId);
    const blog = blogs.find(b => b.id === keyword?.blogId);
    
    if (!blog || !keyword) return;

    setPublishing(true);
    try {
      const fullContent = `
        <img src="${generatedArticle.imageUrl}" alt="${generatedArticle.title}" style="width:100%; height:auto; border-radius:8px; margin-bottom:20px;" />
        ${generatedArticle.content}
        <br><br>
        <p><em>${generatedArticle.metaDescription}</em></p>
      `;

      // 1. Send to Blogger via API
      await axios.post("/api/publish", {
        bloggerEmail: blog.bloggerEmail,
        title: generatedArticle.title,
        content: fullContent,
        labels: [keyword.niche]
      });

      // 2. Update Keyword status
      await updateDoc(doc(db, "keywords", keyword.id), {
        status: "published",
        publishedAt: serverTimestamp(),
      });

      // 3. Log the activity
      await addDoc(collection(db, "activity"), {
        userId: user?.uid,
        action: "Published Article",
        target: generatedArticle.title,
        blogName: blog.name,
        createdAt: serverTimestamp(),
      });

      alert("Article published successfully!");
      setGeneratedArticle(null);
      setSelectedKeywordId("");
    } catch (error) {
      console.error("Publishing Error:", error);
      alert("Failed to publish article.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Article Generator</h1>
        <p className="text-slate-500">Transform your keywords into SEO-optimized articles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Search size={20} className="text-blue-600" />
              Select Keyword
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Unused Keywords</label>
                <select 
                  value={selectedKeywordId}
                  onChange={(e) => setSelectedKeywordId(e.target.value)}
                  className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Choose a keyword --</option>
                  {keywords.map(kw => (
                    <option key={kw.id} value={kw.id}>{kw.keyword} ({kw.niche})</option>
                  ))}
                </select>
              </div>
              <Button 
                className="w-full" 
                onClick={handleGenerate} 
                disabled={generating || !selectedKeywordId}
              >
                {generating ? <><Loader2 className="animate-spin mr-2" size={18} /> Generating...</> : "Generate Article"}
              </Button>
            </div>
          </div>

          {generatedArticle && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Send size={20} className="text-blue-600" />
                Publish Settings
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Target Blog</p>
                  <p className="text-sm font-bold text-slate-900">
                    {blogs.find(b => b.id === keywords.find(k => k.id === selectedKeywordId)?.blogId)?.name || "N/A"}
                  </p>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                  onClick={handlePublish}
                  disabled={publishing}
                >
                  {publishing ? <><Loader2 className="animate-spin mr-2" size={18} /> Publishing...</> : "Publish to Blogger"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setGeneratedArticle(null)}
                >
                  Discard
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {generatedArticle ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Preview
                </h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    <Eye size={14} /> Full Preview
                  </Button>
                </div>
              </div>
              <div className="p-8 space-y-6 max-h-[700px] overflow-y-auto prose prose-slate max-w-none">
                {generatedArticle.imageUrl && (
                  <img 
                    src={generatedArticle.imageUrl} 
                    alt={generatedArticle.title} 
                    className="w-full h-auto rounded-xl shadow-md mb-8"
                  />
                )}
                <h1 className="text-3xl font-extrabold text-slate-900">{generatedArticle.title}</h1>
                <div 
                  className="text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: generatedArticle.content }}
                />
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-900 mb-2">Meta Description:</p>
                  <p className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {generatedArticle.metaDescription}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border border-slate-100 border-dashed text-center p-12">
              <div className="p-6 bg-slate-50 rounded-full mb-6">
                <FileText size={48} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to generate?</h3>
              <p className="text-slate-500 max-w-md">
                Select a keyword from the sidebar and click "Generate Article" to see the magic happen.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
