"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, User, Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginScreen() {
  const { loginAdmin, loginEmployee } = useAuth();

  const [activeTab, setActiveTab] = useState<"admin" | "employee">("admin");

  // Admin form state
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("admin123");

  // Employee form state (Employee ID or Name - no email required)
  const [employeeIdentifier, setEmployeeIdentifier] = useState("BYT-101");
  const [employeePassword, setEmployeePassword] = useState("password123");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await loginAdmin(adminPassword, adminUsername);
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Invalid admin credentials");
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await loginEmployee(employeeIdentifier, employeePassword);
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to log in");
    }
  };

  // Quick fill demo helpers
  const fillAdmin = () => {
    setActiveTab("admin");
    setAdminUsername("admin");
    setAdminPassword("admin123");
    setError(null);
  };

  const fillActiveEmployee = (empId: string) => {
    setActiveTab("employee");
    setEmployeeIdentifier(empId);
    setEmployeePassword("password123");
    setError(null);
  };

  const fillInactiveEmployee = () => {
    setActiveTab("employee");
    setEmployeeIdentifier("BYT-107");
    setEmployeePassword("password123");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F6FAF0] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#A2FC4B] selection:text-[#331E1E]">
      {/* Background ambient branding accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#A2FC4B]/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#331E1E]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-2 bg-white rounded-2xl shadow-by border border-[#E2EAD6] mb-4">
            {/* Logo Circular Badge from uploaded asset */}
            <img
              src="/logo-badge.png"
              alt="B & Y Technologies Logo Badge"
              className="w-20 h-20 rounded-full mx-auto object-contain shadow-sm ring-4 ring-[#A2FC4B]/30"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-[#331E1E] font-serif uppercase">
            B &amp; Y TECHNOLOGIES
          </h1>
          <p className="text-xs font-semibold tracking-widest text-[#706161] uppercase mt-1">
            Digital Marketing Agency • HR &amp; Employee CRM
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-by-lg border border-[#E2EAD6] overflow-hidden">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-[#E2EAD6] bg-[#F6FAF0]/60 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab("admin");
                setError(null);
              }}
              className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "admin"
                  ? "bg-[#331E1E] text-white shadow-sm"
                  : "text-[#706161] hover:text-[#331E1E] hover:bg-white/60"
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${activeTab === "admin" ? "text-[#A2FC4B]" : ""}`} />
              HR Admin Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("employee");
                setError(null);
              }}
              className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "employee"
                  ? "bg-[#331E1E] text-white shadow-sm"
                  : "text-[#706161] hover:text-[#331E1E] hover:bg-white/60"
              }`}
            >
              <User className={`w-3.5 h-3.5 ${activeTab === "employee" ? "text-[#A2FC4B]" : ""}`} />
              Employee Portal
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Alert Banner */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{error}</div>
              </div>
            )}

            {activeTab === "admin" ? (
              /* HR ADMIN LOGIN FORM */
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#331E1E] uppercase tracking-wider mb-1.5">
                    Admin Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F6FAF0]/50 border border-[#E2EAD6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A2FC4B] focus:border-transparent text-[#331E1E]"
                    />
                    <User className="w-4 h-4 text-[#706161] absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#331E1E] uppercase tracking-wider mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F6FAF0]/50 border border-[#E2EAD6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A2FC4B] focus:border-transparent text-[#331E1E]"
                    />
                    <Lock className="w-4 h-4 text-[#706161] absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#331E1E] hover:bg-[#422828] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70"
                  >
                    {loading ? "Authenticating..." : "Access HR Admin Workspace"}
                    <ArrowRight className="w-4 h-4 text-[#A2FC4B] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            ) : (
              /* EMPLOYEE LOGIN FORM - NO EMAIL REQUIRED */
              <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#331E1E] uppercase tracking-wider">
                      Employee ID (or Name)
                    </label>
                    <span className="text-[10px] text-[#A2FC4B] bg-[#331E1E] px-2 py-0.2 rounded font-mono font-bold">
                      No email needed
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={employeeIdentifier}
                      onChange={(e) => setEmployeeIdentifier(e.target.value)}
                      placeholder="e.g. BYT-101 (or Priya Sharma)"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F6FAF0]/50 border border-[#E2EAD6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A2FC4B] focus:border-transparent text-[#331E1E] font-medium"
                    />
                    <User className="w-4 h-4 text-[#706161] absolute left-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-[#706161] mt-1">
                    Enter your assigned Employee ID (e.g. <span className="font-mono font-bold text-[#331E1E]">BYT-101</span>) or full name.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#331E1E] uppercase tracking-wider mb-1.5">
                    Portal Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={employeePassword}
                      onChange={(e) => setEmployeePassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F6FAF0]/50 border border-[#E2EAD6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A2FC4B] focus:border-transparent text-[#331E1E]"
                    />
                    <Lock className="w-4 h-4 text-[#706161] absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#A2FC4B] hover:bg-[#91e73e] text-[#331E1E] font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70"
                  >
                    {loading ? "Verifying..." : "Sign In to Employee Portal"}
                    <ArrowRight className="w-4 h-4 text-[#331E1E] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <p className="text-[11px] text-center text-[#706161]">
                  🔒 Note: Every employee login is timestamped &amp; audited for HR compliance.
                </p>
              </form>
            )}
          </div>

          {/* Quick Demo Pre-fills */}
          <div className="p-4 bg-[#F6FAF0] border-t border-[#E2EAD6] text-xs">
            <div className="flex items-center gap-1.5 text-[#331E1E] font-bold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#A2FC4B]" />
              <span>Quick Demo Logins (Click to test):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={fillAdmin}
                className="px-2.5 py-1.5 bg-white hover:bg-[#331E1E] hover:text-[#A2FC4B] text-[#331E1E] font-medium rounded-lg border border-[#E2EAD6] transition-all text-[11px]"
              >
                🔑 HR Admin (admin)
              </button>
              <button
                type="button"
                onClick={() => fillActiveEmployee("BYT-101")}
                className="px-2.5 py-1.5 bg-white hover:bg-[#331E1E] hover:text-[#A2FC4B] text-[#331E1E] font-medium rounded-lg border border-[#E2EAD6] transition-all text-[11px]"
              >
                👤 Priya (ID: BYT-101)
              </button>
              <button
                type="button"
                onClick={() => fillActiveEmployee("BYT-102")}
                className="px-2.5 py-1.5 bg-white hover:bg-[#331E1E] hover:text-[#A2FC4B] text-[#331E1E] font-medium rounded-lg border border-[#E2EAD6] transition-all text-[11px]"
              >
                👤 Rahul (ID: BYT-102)
              </button>
              <button
                type="button"
                onClick={fillInactiveEmployee}
                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg border border-red-200 transition-all text-[11px]"
                title="Test inactive employee login block"
              >
                🚫 Meera (ID: BYT-107 - Inactive)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-[#706161]">
          <p>&copy; 2026 B &amp; Y Technologies. Together, we&apos;ll grow your business.</p>
        </div>
      </div>
    </div>
  );
}
