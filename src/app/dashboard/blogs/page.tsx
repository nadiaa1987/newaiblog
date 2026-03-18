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
  serverTimestamp 
} from "firebase/firestore";
import { 
  Plus, 
  Trash2, 
  Globe, 
  ExternalLink, 
  Mail, 
  Tag, 
  Settings 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Blog {
  id: string;
  name: string;
  url: string;
  bloggerEmail: string;
  niche: string;
  userId: string;
  createdAt: any;
}

export default function BlogsPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newBlog, setNewBlog] = useState({
    name: "",
    url: "",
    bloggerEmail: "",
    niche: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "blogs"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
      setBlogs(blogsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newBlog.name || !newBlog.url || !newBlog.bloggerEmail || !newBlog.niche) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "blogs"), {
        ...newBlog,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewBlog({ name: "", url: "", bloggerEmail: "", niche: "" });
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteDoc(doc(db, "blogs", id));
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Blogs</h1>
          <p className="text-slate-500">Manage and connect your Blogger blogs.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2">
          {isAdding ? "Cancel" : <><Plus size={18} /> Connect New Blog</>}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Globe size={20} className="text-blue-600" />
            Connect Blogger Blog
          </h2>
          <form onSubmit={handleAddBlog} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Blog Name</label>
              <input 
                type="text" 
                required
                value={newBlog.name}
                onChange={(e) => setNewBlog({ ...newBlog, name: e.target.value })}
                placeholder="My Awesome Tech Blog"
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Blog URL</label>
              <input 
                type="url" 
                required
                value={newBlog.url}
                onChange={(e) => setNewBlog({ ...newBlog, url: e.target.value })}
                placeholder="https://myblog.blogspot.com"
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Blogger Secret Email</label>
              <input 
                type="email" 
                required
                value={newBlog.bloggerEmail}
                onChange={(e) => setNewBlog({ ...newBlog, bloggerEmail: e.target.value })}
                placeholder="yourname.secret@blogger.com"
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-slate-400">Found in Blogger Settings &gt; Email &gt; Posting using email</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Blog Niche</label>
              <input 
                type="text" 
                required
                value={newBlog.niche}
                onChange={(e) => setNewBlog({ ...newBlog, niche: e.target.value })}
                placeholder="Technology, Health, Travel..."
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Connecting..." : "Connect Blog"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-slate-100 border-dashed">
            <div className="p-4 bg-slate-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Globe size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No blogs connected</h3>
            <p className="text-slate-500 mb-6">Connect your first Blogger blog to start using AI tools.</p>
            <Button onClick={() => setIsAdding(true)} variant="outline">Connect Now</Button>
          </div>
        ) : (
          blogs.map((blog) => (
            <div key={blog.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Globe size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDeleteBlog(blog.id)}
                    className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{blog.name}</h3>
              <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                <Tag size={12} /> {blog.niche}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ExternalLink size={14} className="text-slate-400" />
                  <a href={blog.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 truncate">{blog.url}</a>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail size={14} className="text-slate-400" />
                  <span className="truncate">{blog.bloggerEmail}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-50">
                <Button variant="ghost" size="sm" className="flex-1 text-xs gap-1">
                  <Settings size={14} /> Manage
                </Button>
                <a 
                  href={blog.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 flex-1 gap-1"
                >
                  <ExternalLink size={14} /> Visit
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
