"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, Bell, Zap, Key } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account and platform preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Profile Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-sm">
                    <Mail size={16} />
                    {user?.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Account ID</label>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-xs font-mono truncate">
                    {user?.uid}
                  </div>
                </div>
              </div>
              <Button variant="outline">Update Profile</Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Key size={20} className="text-blue-600" />
              API & Security
            </h2>
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h3 className="text-sm font-bold text-amber-900 mb-1 flex items-center gap-2">
                  <Shield size={16} />
                  Two-Factor Authentication
                </h3>
                <p className="text-xs text-amber-700 mb-4">Add an extra layer of security to your account.</p>
                <Button size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100">Enable 2FA</Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Automation Webhook Secret</label>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    readOnly 
                    value="ai-blogger-studio-secret-2026"
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-xs font-mono"
                  />
                  <Button variant="outline" size="sm">Copy</Button>
                </div>
                <p className="text-[10px] text-slate-400">Use this secret in your CRON job headers: Authorization: Bearer [SECRET]</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Bell size={20} className="text-blue-600" />
              Notifications
            </h2>
            <div className="space-y-4">
              {[
                { label: "Email on success", desc: "Get an email when a post is published." },
                { label: "Automation alerts", desc: "Notify me if an automation fails." },
                { label: "Weekly reports", desc: "Summary of blog performance." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <input type="checkbox" defaultChecked className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-xl shadow-lg text-white space-y-4">
            <div className="p-2 bg-white/20 rounded-lg w-fit">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold">Pro Plan</h3>
            <p className="text-sm text-blue-100">You are currently on the Pro Plan. Enjoy unlimited blogs and high-speed AI generation.</p>
            <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">Manage Subscription</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
