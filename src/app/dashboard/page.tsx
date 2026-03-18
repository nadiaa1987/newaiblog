"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from "firebase/firestore";
import { 
  Globe, 
  Search, 
  FileText, 
  Zap, 
  TrendingUp, 
  CheckCircle, 
  Clock 
} from "lucide-react";

interface Activity {
  id: string;
  action: string;
  target: string;
  blogName: string;
  createdAt: { toDate: () => Date };
}

interface Automation {
  id: string;
  name: string;
  status: string;
  postsPerDay: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [counts, setCounts] = useState({
    blogs: 0,
    keywords: 0,
    published: 0,
    activeAutos: 0,
  });

  useEffect(() => {
    if (!user) return;

    // Fetch counts
    const blogsQ = query(collection(db, "blogs"), where("userId", "==", user.uid));
    const unsubscribeBlogs = onSnapshot(blogsQ, (snap) => {
      setCounts(prev => ({ ...prev, blogs: snap.size }));
    });

    const keywordsQ = query(collection(db, "keywords"), where("userId", "==", user.uid));
    const unsubscribeKeywords = onSnapshot(keywordsQ, (snap) => {
      setCounts(prev => ({ ...prev, keywords: snap.size }));
      setCounts(prev => ({ ...prev, published: snap.docs.filter(d => d.data().status === 'published').length }));
    });

    // Fetch recent activity
    const activityQ = query(
      collection(db, "activity"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubscribeActivity = onSnapshot(activityQ, (snap) => {
      setActivities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity)));
    });

    // Fetch automations
    const autoQ = query(collection(db, "automations"), where("userId", "==", user.uid));
    const unsubscribeAuto = onSnapshot(autoQ, (snap) => {
      const autos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Automation));
      setAutomations(autos);
      setCounts(prev => ({ ...prev, activeAutos: autos.filter(a => a.status === 'active').length }));
    });

    return () => {
      unsubscribeBlogs();
      unsubscribeKeywords();
      unsubscribeActivity();
      unsubscribeAuto();
    };
  }, [user]);

  const stats = [
    { label: "Active Blogs", value: counts.blogs.toString(), icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Keywords Found", value: counts.keywords.toString(), icon: Search, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Articles Published", value: counts.published.toString(), icon: FileText, color: "text-green-600", bg: "bg-green-50" },
    { label: "Active Automations", value: counts.activeAutos.toString(), icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.email?.split('@')[0]}!</h1>
        <p className="text-slate-500">Here's what's happening with your AI Blogger Studio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4 text-center">No recent activity found.</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-full">
                      <CheckCircle size={16} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-xs text-slate-500">{activity.target} - {activity.blogName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={12} />
                    <span>
                      {activity.createdAt ? new Date(activity.createdAt.toDate()).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-amber-600" />
            Active Automations
          </h2>
          <div className="space-y-4">
            {automations.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4 text-center">No active automations.</p>
            ) : (
              automations.map((auto) => (
                <div key={auto.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{auto.name}</p>
                      <p className="text-xs text-slate-500">{auto.postsPerDay} posts / day</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${auto.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {auto.status}
                    </span>
                  </div>
                  {auto.status === 'active' && (
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                      <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: `100%` }}></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
