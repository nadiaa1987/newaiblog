"use client";

import { useState } from "react";
import { 
  Palette, 
  Download, 
  Monitor, 
  Smartphone, 
  Search, 
  Zap, 
  CheckCircle, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { themeGenerator } from "@/lib/theme";

export default function ThemeGeneratorPage() {
  const [themeData, setThemeData] = useState({
    niche: "",
    color: "#3b82f6",
    layout: "contained",
    logoText: "",
  });
  const [generating, setGenerating] = useState(false);
  const [generatedXml, setGeneratedXml] = useState<string | null>(null);

  const handleGenerateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeData.niche || !themeData.logoText) return;

    setGenerating(true);
    try {
      const xml = await themeGenerator.generateTheme(
        themeData.niche,
        themeData.color,
        themeData.layout,
        themeData.logoText
      );
      setGeneratedXml(xml);
    } catch (error) {
      console.error("Theme Generation Error:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedXml) return;
    const blob = new Blob([generatedXml], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blogger-theme-${themeData.logoText.toLowerCase().replace(/\s+/g, '-')}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Blogger Theme Generator</h1>
        <p className="text-slate-500">Create a responsive, SEO-optimized theme for your blog.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Palette size={20} className="text-blue-600" />
            Theme Settings
          </h2>
          <form onSubmit={handleGenerateTheme} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Blog Niche</label>
              <input 
                type="text" 
                required
                value={themeData.niche}
                onChange={(e) => setThemeData({ ...themeData, niche: e.target.value })}
                placeholder="e.g. Technology, Food, Fitness"
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Logo Text</label>
              <input 
                type="text" 
                required
                value={themeData.logoText}
                onChange={(e) => setThemeData({ ...themeData, logoText: e.target.value })}
                placeholder="e.g. Tech Studio"
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Primary Color</label>
              <div className="flex gap-4">
                <input 
                  type="color" 
                  value={themeData.color}
                  onChange={(e) => setThemeData({ ...themeData, color: e.target.value })}
                  className="h-10 w-20 rounded-md border border-slate-200 p-1 cursor-pointer"
                />
                <input 
                  type="text" 
                  value={themeData.color}
                  onChange={(e) => setThemeData({ ...themeData, color: e.target.value })}
                  className="flex-1 rounded-md border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Layout Style</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setThemeData({ ...themeData, layout: "contained" })}
                  className={`p-3 rounded-lg border text-sm flex flex-col items-center gap-2 transition-colors ${themeData.layout === 'contained' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}
                >
                  <div className="w-12 h-8 bg-current opacity-20 rounded-sm mb-1"></div>
                  Contained
                </button>
                <button
                  type="button"
                  onClick={() => setThemeData({ ...themeData, layout: "full-width" })}
                  className={`p-3 rounded-lg border text-sm flex flex-col items-center gap-2 transition-colors ${themeData.layout === 'full-width' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}
                >
                  <div className="w-16 h-8 bg-current opacity-20 rounded-sm mb-1"></div>
                  Full Width
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={generating}
            >
              {generating ? <><Loader2 className="animate-spin mr-2" size={18} /> Generating...</> : "Generate Theme"}
            </Button>
          </form>
        </div>

        {/* Preview & Features */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Zap size={20} className="text-amber-600" />
              Theme Features (Built-in)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Responsive", icon: Smartphone, color: "text-blue-500" },
                { label: "Fast Loading", icon: Zap, color: "text-amber-500" },
                { label: "SEO Optimized", icon: Search, color: "text-green-500" },
                { label: "Schema Ready", icon: CheckCircle, color: "text-purple-500" },
              ].map((feature, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center gap-2">
                  <div className={`p-2 rounded-lg bg-white shadow-sm ${feature.color}`}>
                    <feature.icon size={20} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {generatedXml ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Monitor size={20} className="text-blue-600" />
                  Live Preview (Mock)
                </h2>
                <Button 
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Download size={18} /> Download XML
                </Button>
              </div>
              <div className="p-8 bg-slate-900 max-h-[500px] overflow-y-auto">
                <pre className="text-xs text-blue-300 font-mono">
                  {generatedXml.slice(0, 1000)}...
                </pre>
              </div>
              <div className="p-4 bg-blue-50 text-blue-800 text-xs flex items-center gap-2">
                <CheckCircle size={14} />
                XML theme generated successfully. Upload this to Blogger &gt; Theme &gt; Edit HTML.
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-xl border border-slate-100 border-dashed text-center p-12">
              <div className="p-6 bg-slate-50 rounded-full mb-6 text-slate-300">
                <Palette size={48} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Generate your theme</h3>
              <p className="text-slate-500 max-w-md">
                Enter your blog details in the sidebar to generate a custom, SEO-optimized Blogger XML theme.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
