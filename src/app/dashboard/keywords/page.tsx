"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  getDocs 
} from "firebase/firestore";
import { 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle, 
  Circle, 
  Zap, 
  Layout 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface Keyword {
  id: string;
  keyword: string;
  blogId: string;
  userId: string;
  status: "unused" | "published";
  niche: string;
  search_volume: number;
  difficulty: number;
  createdAt: { toDate: () => Date };
}

interface Blog {
  id: string;
  name: string;
  niche: string;
}

export default function KeywordsPage() {
  const { user } = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<string>("");
  const [manualInput, setManualInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [clustering, setClustering] = useState(false);
  const [clusters, setClusters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!user) return;

    // Fetch Blogs
    const blogsQuery = query(collection(db, "blogs"), where("userId", "==", user.uid));
    const unsubscribeBlogs = onSnapshot(blogsQuery, (snapshot) => {
      const blogsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
      setBlogs(blogsData);
      if (blogsData.length > 0 && !selectedBlog) {
        setSelectedBlog(blogsData[0].id);
      }
    });

    // Fetch Keywords
    const keywordsQuery = query(collection(db, "keywords"), where("userId", "==", user.uid));
    const unsubscribeKeywords = onSnapshot(keywordsQuery, (snapshot) => {
      const keywordsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Keyword));
      setKeywords(keywordsData);
    });

    return () => {
      unsubscribeBlogs();
      unsubscribeKeywords();
    };
  }, [user, selectedBlog]);

  const handleAddKeywords = async () => {
    if (!selectedBlog || !manualInput.trim() || !user) return;

    setLoading(true);
    const blog = blogs.find(b => b.id === selectedBlog);
    const keywordList = manualInput.split("\n").filter(k => k.trim());

    try {
      for (const kw of keywordList) {
        await addDoc(collection(db, "keywords"), {
          keyword: kw.trim(),
          blogId: selectedBlog,
          userId: user.uid,
          status: "unused",
          niche: blog?.niche || "General",
          search_volume: Math.floor(Math.random() * 10000) + 100,
          difficulty: Math.floor(Math.random() * 100),
          createdAt: serverTimestamp(),
        });
      }
      setManualInput("");
    } catch (error) {
      console.error("Error adding keywords:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    try {
      await deleteDoc(doc(db, "keywords", id));
    } catch (error) {
      console.error("Error deleting keyword:", error);
    }
  };

  const handleClusterKeywords = async () => {
    if (keywords.length === 0) return;
    setClustering(true);
    try {
      const keywordTexts = keywords.map(k => k.keyword);
      const response = await axios.post("/api/ai/cluster", {
        keywords: keywordTexts
      });
      setClusters(response.data);
    } catch (error) {
      console.error("Clustering Error:", error);
      alert("Failed to cluster keywords.");
    } finally {
      setClustering(false);
    }
  };

  const filteredKeywords = selectedBlog 
    ? keywords.filter(k => k.blogId === selectedBlog)
    : keywords;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Keyword Management</h1>
          <p className="text-slate-500">Add, organize, and cluster keywords for your blogs.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={handleClusterKeywords} 
            disabled={clustering || keywords.length === 0}
            className="flex items-center gap-2"
          >
            <Layout size={18} />
            {clustering ? "Clustering..." : "AI Cluster"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Manual Entry */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-blue-600" />
            Add Keywords
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Select Blog</label>
              <select 
                value={selectedBlog}
                onChange={(e) => setSelectedBlog(e.target.value)}
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {blogs.map(blog => (
                  <option key={blog.id} value={blog.id}>{blog.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Keywords (One per line)</label>
              <textarea 
                rows={10}
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="best running shoes&#10;running gear for beginners&#10;marathon training tips"
                className="w-full rounded-md border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleAddKeywords} 
              disabled={loading || !selectedBlog || !manualInput.trim()}
            >
              {loading ? "Adding..." : "Add to Blog"}
            </Button>
          </div>
        </div>

        {/* Keyword List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Search size={20} className="text-blue-600" />
              Keyword List
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter by Blog:</span>
              <select 
                value={selectedBlog}
                onChange={(e) => setSelectedBlog(e.target.value)}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Blogs</option>
                {blogs.map(blog => (
                  <option key={blog.id} value={blog.id}>{blog.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Keyword</th>
                  <th className="px-6 py-4 font-medium">Niche</th>
                  <th className="px-6 py-4 font-medium">Volume</th>
                  <th className="px-6 py-4 font-medium">Difficulty</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredKeywords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                      No keywords found. Add some to get started.
                    </td>
                  </tr>
                ) : (
                  filteredKeywords.map((kw) => (
                    <tr key={kw.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{kw.keyword}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded-full">{kw.niche}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{kw.search_volume.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${kw.difficulty > 70 ? 'bg-red-500' : kw.difficulty > 40 ? 'bg-amber-500' : 'bg-green-500'}`} 
                              style={{ width: `${kw.difficulty}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-500">{kw.difficulty}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${kw.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {kw.status === 'published' ? <CheckCircle size={12} /> : <Circle size={12} />}
                          {kw.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteKeyword(kw.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Clusters View */}
      {Object.keys(clusters).length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Zap size={20} className="text-amber-600" />
            AI Keyword Clusters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(clusters).map(([topic, kws]) => (
              <div key={topic} className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center justify-between">
                  {topic}
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">{kws.length}</span>
                </h3>
                <ul className="space-y-2">
                  {kws.map((kw, idx) => (
                    <li key={idx} className="text-sm text-blue-700 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      {kw}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
