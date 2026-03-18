"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Globe, Zap, Search, Layout, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-50 py-4 px-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-xl font-bold text-slate-900">
          <span className="text-blue-600">AI</span> Blogger Studio
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Login</Link>
          <Link href="/auth/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold animate-fade-in">
          <Zap size={16} /> New: AI 2026 SEO Engine is live
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight">
          Build SEO Optimized <br />
          <span className="text-blue-600">Blogger Blogs</span> on Autopilot
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          The all-in-one platform for automated keyword research, AI article generation, theme design, and auto-publishing to Blogger.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/auth/signup">
            <Button size="lg" className="h-14 px-8 text-lg rounded-xl flex items-center gap-2">
              Start Building Now <ArrowRight size={20} />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-xl">
            View Live Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: "AI Keyword Research", 
              desc: "Automatically find low-competition keywords in your niche with search volume analysis.",
              icon: Search,
              color: "text-blue-600",
              bg: "bg-blue-100"
            },
            { 
              title: "Smart Article Generator", 
              desc: "Generate 1500-2500 word SEO optimized articles with images and meta tags using Pollinations AI.",
              icon: Zap,
              color: "text-amber-600",
              bg: "bg-amber-100"
            },
            { 
              title: "Blogger Automation", 
              desc: "Schedule and auto-publish content directly to unlimited Blogger blogs via Email-to-Post.",
              icon: Globe,
              color: "text-green-600",
              bg: "bg-green-100"
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className={`p-3 rounded-xl ${feature.bg} ${feature.color} w-fit mb-6`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Why choose AI Blogger Studio?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            {[
              "100% SEO Optimized Themes (Blogger XML)",
              "Automated Keyword Clustering & Topic Discovery",
              "Unlimited Blog Connections via Email-to-Post",
              "Advanced Schema Markup & Structured Data",
              "High-Quality AI Images for Every Post",
              "24/7 Automation Engine (CRON Driven)"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-green-100 text-green-600 p-1 rounded-full">
                  <CheckCircle size={18} />
                </div>
                <span className="text-lg font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Layout size={200} />
            </div>
            <h3 className="text-2xl font-bold mb-4 relative z-10">Modern Dashboard UI</h3>
            <p className="text-slate-400 mb-8 relative z-10">
              Manage all your blogs, keywords, and automations from a single, intuitive interface designed for efficiency.
            </p>
            <div className="flex gap-2 relative z-10">
              <div className="w-12 h-12 bg-blue-600 rounded-lg"></div>
              <div className="w-12 h-12 bg-slate-800 rounded-lg"></div>
              <div className="w-12 h-12 bg-slate-800 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl font-bold text-slate-900">Ready to dominate search results?</h2>
        <p className="text-lg text-slate-500">Join hundreds of bloggers using AI Blogger Studio to build high-traffic blogs in minutes.</p>
        <Link href="/auth/signup">
          <Button size="lg" className="h-16 px-12 text-xl rounded-2xl shadow-xl shadow-blue-200">
            Get Started for Free
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-50 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-8">
          <div className="text-xl font-bold text-slate-900">
            <span className="text-blue-600">AI</span> Blogger Studio
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <Link href="#" className="hover:text-blue-600">Privacy Policy</Link>
            <Link href="#" className="hover:text-blue-600">Terms of Service</Link>
            <Link href="#" className="hover:text-blue-600">Documentation</Link>
          </div>
          <div className="text-sm text-slate-400">
            &copy; 2026 AI Blogger Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
