"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Globe, 
  Search, 
  Palette, 
  FileText, 
  Settings, 
  Zap, 
  LogOut 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "My Blogs", icon: Globe, href: "/dashboard/blogs" },
  { name: "Keyword Research", icon: Search, href: "/dashboard/keywords" },
  { name: "Theme Generator", icon: Palette, href: "/dashboard/theme" },
  { name: "Article Generator", icon: FileText, href: "/dashboard/articles" },
  { name: "Automation", icon: Zap, href: "/dashboard/automation" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-900 text-white">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-400">AI Blogger Studio</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
