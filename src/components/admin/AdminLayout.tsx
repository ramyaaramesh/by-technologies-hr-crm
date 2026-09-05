"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Clock,
  CalendarOff,
  History,
  Briefcase,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Shield,
  UserCheck,
  FolderArchive,
  MessageSquare,
  Bell,
} from "lucide-react";
import EmployeeRecordsSection from "./EmployeeRecordsSection";
import AttendanceSection from "./AttendanceSection";
import HRWorkspaceSection from "./HRWorkspaceSection";
import TeamChatSection from "@/components/chat/TeamChatSection";
import LeaveAbsenceSection from "./LeaveAbsenceSection";
import LoginTimesSection from "./LoginTimesSection";
import RecruitmentSection from "./RecruitmentSection";

export type AdminSection =
  | "employees"
  | "attendance"
  | "workspace"
  | "chat"
  | "leaves"
  | "logins"
  | "recruitment";

export default function AdminLayout() {
  const { adminName, logout, switchRole } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>("employees");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Poll for unread admin messages
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const res = await fetch("/api/chat?userId=admin&countOnly=true");
        const data = await res.json();
        if (data.success) {
          setUnreadChatCount(data.totalUnread || 0);
        }
      } catch (e) {
        // silent
      }
    };
    checkUnread();
    const timer = setInterval(checkUnread, 4000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    {
      id: "employees" as AdminSection,
      label: "Employee records",
      icon: Users,
      badge: "CRUD",
    },
    {
      id: "attendance" as AdminSection,
      label: "Attendance & Calendar",
      icon: Clock,
      badge: "Matrix",
    },
    {
      id: "workspace" as AdminSection,
      label: "HR Workspace & Vault",
      icon: FolderArchive,
      badge: "Excel/Word",
    },
    {
      id: "chat" as AdminSection,
      label: "Team Connect",
      icon: MessageSquare,
      badge: unreadChatCount > 0 ? `${unreadChatCount} new` : "Chat",
      highlight: unreadChatCount > 0,
    },
    {
      id: "leaves" as AdminSection,
      label: "Leave & absence",
      icon: CalendarOff,
      badge: "Approvals",
    },
    {
      id: "logins" as AdminSection,
      label: "Login times",
      icon: History,
      badge: "Audit Log",
    },
    {
      id: "recruitment" as AdminSection,
      label: "Recruitment",
      icon: Briefcase,
      badge: "Openings",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6FAF0] flex flex-col md:flex-row text-[#331E1E]">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#331E1E] text-white border-b border-[#422828] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img
            src="/logo-badge.png"
            alt="B & Y Logo"
            className="w-8 h-8 rounded-full object-contain ring-2 ring-[#A2FC4B]"
          />
          <div>
            <div className="text-sm font-bold tracking-wider font-serif uppercase">
              B &amp; Y TECHNOLOGIES
            </div>
            <div className="text-[10px] text-[#A2FC4B] font-semibold">HR Admin Portal</div>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#331E1E] text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky md:top-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#442828]">
          <div className="flex items-center gap-3">
            {/* Circular badge with bright green bg */}
            <div className="relative flex-shrink-0">
              <img
                src="/logo-badge.png"
                alt="B & Y Technologies Logo"
                className="w-12 h-12 rounded-full object-contain ring-2 ring-[#A2FC4B] shadow-md"
              />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold tracking-wider text-white font-serif uppercase truncate">
                B &amp; Y TECHNOLOGIES
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#A2FC4B]">
                <Shield className="w-3 h-3" /> HR Admin Portal
              </span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-[#A89898] leading-tight">
            Digital Marketing Agency • People Operations
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-[#A89898] uppercase">
            Management Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#A2FC4B] text-[#331E1E] shadow-sm font-bold"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-[#331E1E]" : "text-[#A2FC4B]"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-[#331E1E] text-[#A2FC4B]"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Demo Switcher & Admin Footer */}
        <div className="p-3 border-t border-[#442828] bg-[#291717] space-y-2.5">
          <div className="bg-[#331E1E] p-2.5 rounded-xl border border-[#442828]">
            <div className="text-[10px] font-bold text-[#A2FC4B] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Quick Switch to Employee View:
            </div>
            <button
              onClick={() => switchRole("employee", "emp_1")}
              className="w-full py-1.5 px-2 bg-white/10 hover:bg-[#A2FC4B] hover:text-[#331E1E] text-white text-[11px] font-medium rounded-lg transition-all flex items-center justify-between cursor-pointer"
            >
              <span>👤 View as Priya (SEO Lead)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#A2FC4B] text-[#331E1E] font-bold text-xs flex items-center justify-center font-serif">
                HR
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">
                  {adminName || "HR Admin"}
                </div>
                <div className="text-[10px] text-[#A89898]">Super Administrator</div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-[#E2EAD6] sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-serif text-[#331E1E] tracking-tight">
              {navItems.find((n) => n.id === activeSection)?.label}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EEFCD9] text-[#2d5208] font-bold border border-[#A2FC4B]/40">
              B &amp; Y Technologies HR Suite
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Team Chat Header Button */}
            <button
              onClick={() => setActiveSection("chat")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeSection === "chat"
                  ? "bg-[#331E1E] text-[#A2FC4B] border-[#331E1E]"
                  : "bg-[#F6FAF0] text-[#331E1E] border-[#E2EAD6] hover:bg-[#E2EAD6]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#A2FC4B]" />
              <span>Team Connect</span>
              {unreadChatCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#A2FC4B] text-[#331E1E] text-[10px] font-bold flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Quick HR Vault Button */}
            <button
              onClick={() => setActiveSection("workspace")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeSection === "workspace"
                  ? "bg-[#331E1E] text-[#A2FC4B] border-[#331E1E]"
                  : "bg-[#F6FAF0] text-[#331E1E] border-[#E2EAD6] hover:bg-[#E2EAD6]"
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5 text-emerald-600" />
              <span>HR Vault</span>
            </button>

            <div className="h-6 w-px bg-[#E2EAD6]" />
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Section Content */}
        <div className="p-4 sm:p-6 md:p-8 flex-1">
          {activeSection === "employees" && <EmployeeRecordsSection />}
          {activeSection === "attendance" && <AttendanceSection />}
          {activeSection === "workspace" && <HRWorkspaceSection />}
          {activeSection === "chat" && (
            <TeamChatSection
              currentUser={{
                id: "admin",
                name: adminName || "HR Admin",
                role: "admin",
                designation: "HR Administration",
              }}
            />
          )}
          {activeSection === "leaves" && <LeaveAbsenceSection />}
          {activeSection === "logins" && <LoginTimesSection />}
          {activeSection === "recruitment" && <RecruitmentSection />}
        </div>
      </main>
    </div>
  );
}
