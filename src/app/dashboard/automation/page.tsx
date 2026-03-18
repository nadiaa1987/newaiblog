"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  Zap, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Clock, 
  Globe, 
  Tag, 
  Loader2, 
  CheckCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Blog {
  id: string;
  name: string;
  niche: string;
}

interface Automation {
  id: string;
  name: string;
  blogId: string;
  postsPerDay: number;
  status: "active" | "paused";
  lastRun: { toDate: () => Date } | null;
  nextRun: { toDate: () => Date } | null;
  userId: string;
}

export default function AutomationPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAuto, setNewAuto] = useState({
    name: "",
    blogId: "",
    postsPerDay: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const bQuery = query(collection(db, "blogs"), where("userId", "==", user.uid));
    const unsubscribeB = onSnapshot(bQuery, (snapshot) => {
      const blogsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
      setBlogs(blogsData);
      if (blogsData.length > 0 && !newAuto.blogId) {
        setNewAuto(prev => ({ ...prev, blogId: blogsData[0].id }));
      }
    });

    const aQuery = query(collection(db, "automations"), where("userId", "==", user.uid));
    const unsubscribeA = onSnapshot(aQuery, (snapshot) => {
      setAutomations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Automation)));
    });

    return () => {
      unsubscribeB();
      unsubscribeA();
    };
  }, [user]);

  const handleAddAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAuto.name || !newAuto.blogId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "automations"), {
        ...newAuto,
        status: "active",
        userId: user.uid,
        lastRun: null,
        nextRun: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      setNewAuto({ name: "", blogId: blogs[0]?.id || "", postsPerDay: 1 });
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding automation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, "automations", id), {
        status: currentStatus === "active" ? "paused" : "active",
      });
    } catch (error) {
      console.error("Error toggling automation:", error);
    }
  };

  const handleDeleteAutomation = async (id: string) => {
    if (confirm("Delete this automation?")) {
      try {
        await deleteDoc(doc(db, "automations", id));
      } catch (error) {
        console.error("Error deleting automation:", error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Automation Engine</h1>
          <p className="text-slate-500">Set up schedules for automatic keyword research and publishing.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2">
          {isAdding ? "Cancel" : <><Plus size={18} /> New Automation</>}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Zap size={20} className="text-blue-600" />
            Create Automation Workflow
          </h2>
          <form onSubmit={handleAddAutomation} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Automation Name</label>
              <input 
                type="text" 
                required
                value={newAuto.name}
                onChange={(e) => setNewAuto({ ...newAuto, name: e.target.value })}
                placeholder="e.g. Daily Tech Posts"
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Blog</label>
              <select 
                value={newAuto.blogId}
                onChange={(e) => setNewAuto({ ...newAuto, blogId: e.target.value })}
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {blogs.map(blog => (
                  <option key={blog.id} value={blog.id}>{blog.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Posts Per Day</label>
              <input 
                type="number" 
                min="1" 
                max="10"
                required
                value={newAuto.postsPerDay}
                onChange={(e) => setNewAuto({ ...newAuto, postsPerDay: parseInt(e.target.value) })}
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="lg:col-span-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
                <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Workflow Logic:
                </h3>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Fetch random keywords for the blog niche</li>
                  <li>Cluster keywords using AI</li>
                  <li>Generate full article and AI images</li>
                  <li>Publish to Blogger via Email-to-Post</li>
                </ul>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <><Loader2 className="animate-spin mr-2" size={18} /> Creating...</> : "Start Automation"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {automations.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-slate-100 border-dashed">
            <div className="p-4 bg-slate-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No automations active</h3>
            <p className="text-slate-500 mb-6">Create an automation to start publishing content on autopilot.</p>
            <Button onClick={() => setIsAdding(true)} variant="outline">Create Now</Button>
          </div>
        ) : (
          automations.map((auto) => {
            const blog = blogs.find(b => b.id === auto.blogId);
            return (
              <div key={auto.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg ${auto.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                    <Zap size={24} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleToggleStatus(auto.id, auto.status)}
                      className={`p-2 rounded-lg transition-colors ${auto.status === 'active' ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-green-500 bg-green-50 hover:bg-green-100'}`}
                      title={auto.status === 'active' ? 'Pause' : 'Start'}
                    >
                      {auto.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button 
                      onClick={() => handleDeleteAutomation(auto.id)}
                      className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-1">{auto.name}</h3>
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                  <Globe size={12} /> {blog?.name || "Unknown Blog"}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Frequency:</span>
                    <span className="font-bold text-slate-700">{auto.postsPerDay} post(s) / day</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Status:</span>
                    <span className={`font-bold ${auto.status === 'active' ? 'text-green-600' : 'text-slate-400'}`}>
                      {auto.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Next Run:</span>
                    <span className="text-slate-700 flex items-center gap-1">
                      <Clock size={12} /> 
                      {auto.nextRun ? new Date(auto.nextRun.toDate()).toLocaleTimeString() : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-50">
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5 self-center overflow-hidden">
                    <div className={`h-full rounded-full bg-blue-600`} style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Running</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
