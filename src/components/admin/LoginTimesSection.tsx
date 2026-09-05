"use client";

import React, { useState, useEffect } from "react";
import { LoginLog } from "@/lib/types";
import {
  History,
  Search,
  Download,
  ShieldCheck,
  Globe,
  Laptop,
  Clock,
  RefreshCw,
  Lock,
} from "lucide-react";

export default function LoginTimesSection() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.employeeName.toLowerCase().includes(q) ||
      (log.empId && log.empId.toLowerCase().includes(q)) ||
      (log.email && log.email.toLowerCase().includes(q)) ||
      log.ipAddress.includes(q)
    );
  });

  const exportCsv = () => {
    const headers = ["Timestamp", "Employee ID", "Employee Name", "Email", "IP Address", "User Agent"];
    const rows = filteredLogs.map((l) => [
      `"${l.loginTime}"`,
      `"${l.empId || ""}"`,
      `"${l.employeeName}"`,
      `"${l.email || ""}"`,
      `"${l.ipAddress}"`,
      `"${l.userAgent.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BY_Technologies_Employee_Login_Logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return {
        dateStr: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        timeStr: d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };
    } catch {
      return { dateStr: iso, timeStr: "" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAD6] shadow-by flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#331E1E]">Employee Portal Login Audit</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#EEFCD9] text-[#2c5306] font-bold text-[10px] border border-[#A2FC4B]/60">
              Read-Only Security Trail
            </span>
          </div>
          <p className="text-xs text-[#706161] mt-0.5">
            Real-time audit log of every employee portal login, captured with timestamp, IP address, and browser metadata.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={exportCsv}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#331E1E] hover:bg-[#442828] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#A2FC4B]" />
            Export CSV Log
          </button>
          <button
            onClick={fetchLogs}
            className="p-2 bg-[#F6FAF0] border border-[#E2EAD6] rounded-xl text-[#706161] hover:text-[#331E1E] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2EAD6] shadow-by flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#706161] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search logs by employee name, work email, or IP address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F6FAF0] border border-[#E2EAD6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A2FC4B] text-[#331E1E]"
          />
        </div>
        <div className="text-xs font-semibold text-[#706161] hidden sm:block">
          Showing {filteredLogs.length} events
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAD6] shadow-by overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#331E1E]">
            <thead className="bg-[#331E1E] text-white uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Device &amp; Client Browser</th>
                <th className="py-3 px-4 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAD6]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-xs text-[#706161]">
                    Fetching login activity records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-xs text-[#706161]">
                    No login records matching your search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const { dateStr, timeStr } = formatTimestamp(log.loginTime);
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#F6FAF0]/70 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#331E1E] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#706161]" />
                          <span>{timeStr}</span>
                        </div>
                        <div className="text-[11px] text-[#706161] font-mono">{dateStr}</div>
                      </td>

                      {/* Employee */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#331E1E]">{log.employeeName}</div>
                        <div className="text-[11px] text-[#706161] font-mono">{log.email}</div>
                      </td>

                      {/* IP Address */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#331E1E]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F6FAF0] rounded border border-[#E2EAD6]">
                          <Globe className="w-3 h-3 text-[#706161]" />
                          {log.ipAddress}
                        </span>
                      </td>

                      {/* User Agent */}
                      <td className="py-3.5 px-4 text-[11px] text-[#706161] max-w-sm truncate" title={log.userAgent}>
                        <div className="flex items-center gap-1.5 truncate">
                          <Laptop className="w-3.5 h-3.5 text-[#331E1E] flex-shrink-0" />
                          <span className="truncate">{log.userAgent}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EEFCD9] text-[#2c5306] border border-[#A2FC4B]/60">
                          <ShieldCheck className="w-3 h-3 text-[#3c7809]" />
                          Authenticated
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
