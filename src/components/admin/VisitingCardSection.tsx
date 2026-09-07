"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Download,
  Printer,
  Save,
  RefreshCw,
  Eye,
  CheckCircle2,
  X,
  User,
  Briefcase,
  Phone,
  Mail,
  Globe,
  MapPin,
  Sparkles,
  Copy,
  Check,
  Edit3,
  Trash2,
  Zap,
  FileText,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Employee, VisitingCardData } from "@/lib/types";

interface VisitingCardSectionProps {
  initialEmployee?: Employee | null;
  onBackToRecords?: () => void;
}

const DEFAULT_CARD_DATA: VisitingCardData = {
  name: "Imran",
  designation: "Business Development Manager",
  phone: "+91 7824878137",
  email: "info@bnytechnologies.com",
  website: "www.bnytechnologies.com",
  address: "No.624, Khivraj Building, 3rdFloor,\nAnna Salai, Chennai - 600006.",
};

export default function VisitingCardSection({
  initialEmployee,
  onBackToRecords,
}: VisitingCardSectionProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    initialEmployee?.id || ""
  );
  const [cardData, setCardData] = useState<VisitingCardData>(DEFAULT_CARD_DATA);
  const [isGeneratedModalOpen, setIsGeneratedModalOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Load employees list on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const data = await res.json();
        if (data.success) {
          let list: Employee[] = data.employees;
          try {
            const raw = localStorage.getItem("byt_deleted_emp_ids");
            if (raw) {
              const deletedIds: string[] = JSON.parse(raw);
              list = list.filter(
                (e) => !deletedIds.includes(e.id) && !deletedIds.includes(e.empId)
              );
            }
          } catch (e) {
            // ignore
          }
          setEmployees(list);

          // If an initial employee was passed, use it
          if (initialEmployee) {
            setSelectedEmpId(initialEmployee.id);
            loadEmployeeToCard(initialEmployee);
          } else if (list.length > 0 && !selectedEmpId) {
            const first = list[0];
            setSelectedEmpId(first.id);
            loadEmployeeToCard(first);
          }
        }
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };
    fetchEmployees();
  }, [initialEmployee]);

  const loadEmployeeToCard = (emp: Employee) => {
    if (emp.visitingCard) {
      setCardData({ ...emp.visitingCard });
    } else {
      setCardData({
        name: emp.name || "",
        designation: emp.designation || "",
        phone: emp.phone || "+91 7824878137",
        email: emp.email || "info@bnytechnologies.com",
        website: "www.bnytechnologies.com",
        address: "No.624, Khivraj Building, 3rdFloor,\nAnna Salai, Chennai - 600006.",
      });
    }
  };

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find((e) => e.id === empId || e.empId === empId);
    if (emp) {
      loadEmployeeToCard(emp);
      showToast(`Populated details for ${emp.name}`);
    }
  };

  const handleResetToDefaults = () => {
    const emp = employees.find(
      (e) => e.id === selectedEmpId || e.empId === selectedEmpId
    );
    if (emp) {
      loadEmployeeToCard(emp);
    } else {
      setCardData(DEFAULT_CARD_DATA);
    }
    showToast("Reset to master template example words (Imran)");
  };

  const handleClearWords = () => {
    setCardData({
      name: "",
      designation: "",
      phone: "",
      email: "",
      website: "",
      address: "",
    });
    showToast("Cleared all card words. Type employee details now.");
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper to split address into 2 lines
  const splitAddress = (addr: string): [string, string] => {
    if (!addr) return ["", ""];
    if (addr.includes("\n")) {
      const parts = addr.split("\n");
      return [parts[0].trim(), parts.slice(1).join(" ").trim()];
    }
    const commaIdx = addr.indexOf(",");
    if (commaIdx !== -1 && addr.length > 30) {
      const secondComma = addr.indexOf(",", commaIdx + 1);
      const splitPoint = secondComma !== -1 ? secondComma + 1 : commaIdx + 1;
      return [addr.substring(0, splitPoint).trim(), addr.substring(splitPoint).trim()];
    }
    return [addr, ""];
  };

  // Render high-resolution master canvas (2048x1024, 2x supersampling of 1024x512)
  // Text coordinates match the exact pixel positions measured from the uploaded visiting card
  const renderCardCanvas = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = "/visiting-card-blank.png";
      img.onload = () => {
        // 1. Draw base blank template image (high quality)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, 2048, 1024);

        // 2. Exact text rendering matching uploaded master card
        ctx.textBaseline = "middle";

        // A. Employee Name (Bold white sans-serif in olive ribbon)
        // Measured: X=768 center, Y=175 center on 2048x1024
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.font = "bold 74px Arial, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(cardData.name || "Employee Name", 740, 175);

        // B. Designation (Bold dark olive in light ribbon)
        // Measured: X=700 center, Y=278 center on 2048x1024, color: #1b2817
        ctx.fillStyle = "#1b2817";
        ctx.textAlign = "center";
        ctx.font = "bold 34px Arial, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(cardData.designation || "Job Designation", 700, 278);

        // C. Contact Information (White text on black polygon)
        // All contact lines start at exactly X = 230 on 2048x1024 (X = 115 on 1024x512)
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";

        // Icon 1: Phone (Y=530 on 2048x1024)
        ctx.font = "bold 32px Arial, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(cardData.phone || "+91 0000000000", 230, 530);

        // Icon 2: Email (Y=630 on 2048x1024)
        ctx.font = "bold 28px Arial, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(cardData.email || "info@bnytechnologies.com", 230, 630);

        // Icon 3: Website (Y=722 on 2048x1024)
        ctx.font = "bold 28px Arial, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(cardData.website || "www.bnytechnologies.com", 230, 722);

        // Icon 4: Office Address (Lines at Y=818 and Y=874 on 2048x1024)
        ctx.font = "bold 24px Arial, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif";
        const [line1, line2] = splitAddress(cardData.address);
        if (line2) {
          ctx.fillText(line1, 230, 818);
          ctx.fillText(line2, 230, 874);
        } else {
          ctx.fillText(line1 || cardData.address || "", 230, 846);
        }

        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      };
      img.onerror = (e) => reject(e);
    });
  };

  // Primary action: GENERATE & OPEN PREVIEW MODAL
  const handleGenerateCard = async () => {
    try {
      setIsGenerating(true);
      const dataUrl = await renderCardCanvas();
      setGeneratedImageUrl(dataUrl);
      setIsGeneratedModalOpen(true);
      showToast("Visiting card generated successfully at 2048 × 1024 master resolution!");
    } catch (err) {
      console.error("Card generation failed:", err);
      showToast("Failed to generate visiting card image.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download High-Resolution PNG (2048x1024)
  const handleDownloadPng = async () => {
    try {
      const dataUrl = generatedImageUrl || (await renderCardCanvas());
      const link = document.createElement("a");
      const safeName = (cardData.name || "Employee").replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `B_and_Y_Technologies_Visiting_Card_${safeName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Visiting card downloaded as high-quality PNG!");
    } catch (err) {
      console.error("Download PNG error:", err);
      showToast("Failed to download PNG.");
    }
  };

  // Download Print-Ready PDF (standard 3.5" x 2" business card)
  const handleDownloadPdf = async () => {
    try {
      const dataUrl = generatedImageUrl || (await renderCardCanvas());
      // Landscape 3.5in x 2.0in
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "in",
        format: [3.5, 2.0],
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, 3.5, 2.0);
      const safeName = (cardData.name || "Employee").replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`B_and_Y_Technologies_Visiting_Card_${safeName}.pdf`);
      showToast("Visiting card downloaded as print-ready PDF (3.5 × 2 in)!");
    } catch (err) {
      console.error("Download PDF error:", err);
      showToast("Failed to generate PDF.");
    }
  };

  // Copy high-res image to clipboard
  const handleCopyToClipboard = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        showToast("Canvas not available");
        return;
      }
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          showToast("Visiting card image copied to clipboard!");
          setTimeout(() => setCopied(false), 3000);
        } else {
          showToast("Clipboard image copy not supported on this browser.");
        }
      });
    } catch (err) {
      console.error("Clipboard copy error:", err);
      showToast("Failed to copy image to clipboard.");
    }
  };

  // Print card with standard 3.5" x 2" sizing
  const handlePrint = async () => {
    try {
      const dataUrl = generatedImageUrl || (await renderCardCanvas());
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to print the visiting card.");
        return;
      }
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Visiting Card - ${cardData.name}</title>
            <style>
              @page {
                size: 3.5in 2in;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background-color: #f0f0f0;
              }
              img {
                width: 3.5in;
                height: 2in;
                object-fit: contain;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              }
              @media print {
                body {
                  background: none;
                  height: auto;
                }
                img {
                  width: 3.5in;
                  height: 2in;
                  box-shadow: none;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="Visiting Card" onload="window.print();window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("Print error:", err);
      showToast("Failed to prepare card for printing");
    }
  };

  // Save card customizations to database
  const handleSaveCard = async () => {
    if (!selectedEmpId) {
      showToast("Please select an employee first");
      return;
    }
    try {
      setIsSaving(true);
      const res = await fetch("/api/visiting-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmpId,
          cardData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        try {
          localStorage.setItem(
            `byt_card_${selectedEmpId}`,
            JSON.stringify(cardData)
          );
        } catch (e) {
          // ignore
        }
        showToast(`Visiting card saved permanently for ${cardData.name}!`);
      } else {
        showToast(data.error || "Failed to save card");
      }
    } catch (err) {
      console.error("Save card error:", err);
      showToast("Network error while saving visiting card");
    } finally {
      setIsSaving(false);
    }
  };

  const [addrLine1, addrLine2] = splitAddress(cardData.address);

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#162E3D] text-[#45C512] font-semibold text-xs rounded-xl shadow-2xl border border-[#45C512]/40 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#45C512] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden Canvas for High-DPI Generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Studio Header */}
      <div className="bg-white rounded-2xl border border-[#DDEAE2] p-6 shadow-by">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#162E3D] text-[#45C512] flex items-center justify-center font-bold shadow-sm">
                <CreditCard className="w-6 h-6 text-[#45C512]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-[#162E3D]">
                    Official Visiting Card Generator
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#45C512]/20 text-[#162E3D] border border-[#45C512]/40">
                    MASTER TEMPLATE &bull; EDITABLE WORDS ONLY
                  </span>
                </div>
                <p className="text-xs text-[#5B7586] mt-0.5">
                  The uploaded card background, geometric polygons, olive ribbon, B&amp;Y logo, contact icons, and QR code are permanently locked.{" "}
                  <strong className="text-[#162E3D]">
                    Only the 6 employee text fields are editable.
                  </strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onBackToRecords && (
              <button
                onClick={onBackToRecords}
                className="px-3.5 py-2 text-xs font-semibold text-[#162E3D] bg-[#F5F9F7] hover:bg-[#DDEAE2] rounded-xl transition-colors cursor-pointer border border-[#DDEAE2]"
              >
                &larr; Back to Employees
              </button>
            )}

            <button
              onClick={handleSaveCard}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#162E3D] hover:bg-[#244254] text-[#45C512] text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save to Employee"}</span>
            </button>

            {/* PREVIEW BUTTON */}
            <button
              onClick={handleGenerateCard}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#45C512] hover:bg-[#3db010] text-[#162E3D] text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 ring-2 ring-[#45C512]/50"
            >
              <Zap className="w-4 h-4 fill-current text-[#162E3D]" />
              <span>{isGenerating ? "Generating..." : "PREVIEW & GENERATE CARD"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Editable Text Fields Only */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DDEAE2] p-6 shadow-by space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDEAE2]">
            <div>
              <h2 className="text-sm font-bold text-[#162E3D] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#45C512]" />
                Editable Text Fields
              </h2>
              <p className="text-[11px] text-[#5B7586]">
                Only these 6 words change. Template background design remains fixed.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearWords}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-200"
                title="Clear all text fields to enter new details"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
              <button
                onClick={handleResetToDefaults}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-[#162E3D] bg-[#F5F9F7] hover:bg-[#DDEAE2] rounded-lg transition-colors cursor-pointer border border-[#DDEAE2]"
                title="Reset to original uploaded card words (Imran)"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sample Words</span>
              </button>
            </div>
          </div>

          {/* Quick Employee Selector */}
          <div>
            <label className="block text-xs font-bold text-[#162E3D] mb-1">
              Select Employee to Auto-Populate
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => handleSelectEmployee(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F5F9F7] border border-[#DDEAE2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#45C512] text-[#162E3D] font-medium"
            >
              <option value="">-- Choose Employee to Populate --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.empId} &bull; {emp.name} ({emp.designation})
                </option>
              ))}
            </select>
          </div>

          {/* Field 1: Employee Name */}
          <div>
            <label className="block text-xs font-bold text-[#162E3D] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#45C512]" />
                1. Employee Name *
              </span>
              <span className="text-[10px] text-[#5B7586]">Top ribbon &bull; Bold White</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={cardData.name}
              onFocus={() => setActiveField("name")}
              onBlur={() => setActiveField(null)}
              onChange={(e) =>
                setCardData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. Imran"
              className={`w-full px-3 py-2 text-xs bg-[#F5F9F7] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#45C512] text-[#162E3D] font-bold transition-all ${
                activeField === "name"
                  ? "border-[#45C512] bg-white ring-2 ring-[#45C512]/30"
                  : "border-[#DDEAE2]"
              }`}
            />
          </div>

          {/* Field 2: Designation */}
          <div>
            <label className="block text-xs font-bold text-[#162E3D] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#45C512]" />
                2. Job Designation *
              </span>
              <span className="text-[10px] text-[#5B7586]">Under name &bull; Dark Olive</span>
            </label>
            <input
              type="text"
              value={cardData.designation}
              onFocus={() => setActiveField("designation")}
              onBlur={() => setActiveField(null)}
              onChange={(e) =>
                setCardData((prev) => ({ ...prev, designation: e.target.value }))
              }
              placeholder="e.g. Business Development Manager"
              className={`w-full px-3 py-2 text-xs bg-[#F5F9F7] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#45C512] text-[#162E3D] transition-all ${
                activeField === "designation"
                  ? "border-[#45C512] bg-white ring-2 ring-[#45C512]/30"
                  : "border-[#DDEAE2]"
              }`}
            />
          </div>

          {/* Field 3: Phone Number */}
          <div>
            <label className="block text-xs font-bold text-[#162E3D] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#45C512]" />
                3. Phone Number *
              </span>
              <span className="text-[10px] text-[#5B7586]">Phone icon &bull; White</span>
            </label>
            <input
              type="text"
              value={cardData.phone}
              onFocus={() => setActiveField("phone")}
              onBlur={() => setActiveField(null)}
              onChange={(e) =>
                setCardData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="e.g. +91 7824878137"
              className={`w-full px-3 py-2 text-xs bg-[#F5F9F7] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#45C512] text-[#162E3D] font-mono font-bold transition-all ${
                activeField === "phone"
                  ? "border-[#45C512] bg-white ring-2 ring-[#45C512]/30"
                  : "border-[#DDEAE2]"
              }`}
            />
          </div>

          {/* Field 4: Email Address */}
          <div>
            <label className="block text-xs font-bold text-[#162E3D] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#45C512]" />
                4. Email Address *
              </span>
              <span className="text-[10px] text-[#5B7586]">Email icon &bull; White</span>
            </label>
            <input
              type="email"
              value={cardData.email}
              onFocus={() => setActiveField("email")}
              onBlur={() => setActiveField(null)}
              onChange={(e) =>
                setCardData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="e.g. info@bnytechnologies.com"
              className={`w-full px-3 py-2 text-xs bg-[#F5F9F7] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#45C512] text-[#162E3D] transition-all ${
                activeField === "email"
                  ? "border-[#45C512] bg-white ring-2 ring-[#45C512]/30"
                  : "border-[#DDEAE2]"
              }`}
            />
          </div>

          {/* Field 5: Website */}
          <div>
            <label className="block text-xs font-bold text-[#162E3D] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#45C512]" />
                5. Website URL *
              </span>
              <span className="text-[10px] text-[#5B7586]">Globe icon &bull; White</span>
            </label>
            <input
              type="text"
              value={cardData.website}
              onFocus={() => setActiveField("website")}
              onBlur={() => setActiveField(null)}
              onChange={(e) =>
                setCardData((prev) => ({ ...prev, website: e.target.value }))
              }
              placeholder="e.g. www.bnytechnologies.com"
              className={`w-full px-3 py-2 text-xs bg-[#F5F9F7] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#45C512] text-[#162E3D] transition-all ${
                activeField === "website"
                  ? "border-[#45C512] bg-white ring-2 ring-[#45C512]/30"
                  : "border-[#DDEAE2]"
              }`}
            />
          </div>

          {/* Field 6: Office Address */}
          <div>
            <label className="block text-xs font-bold text-[#162E3D] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#45C512]" />
                6. Office Address *
              </span>
              <span className="text-[10px] text-[#5B7586]">Pin icon &bull; White (2 lines)</span>
            </label>
            <textarea
              rows={3}
              value={cardData.address}
              onFocus={() => setActiveField("address")}
              onBlur={() => setActiveField(null)}
              onChange={(e) =>
                setCardData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="No.624, Khivraj Building, 3rdFloor,\nAnna Salai, Chennai - 600006."
              className={`w-full px-3 py-2 text-xs bg-[#F5F9F7] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#45C512] text-[#162E3D] transition-all ${
                activeField === "address"
                  ? "border-[#45C512] bg-white ring-2 ring-[#45C512]/30"
                  : "border-[#DDEAE2]"
              }`}
            />
          </div>

          {/* Fixed Design Notice */}
          <div className="p-3 bg-[#F5F9F7] rounded-xl border border-[#DDEAE2] text-[11px] text-[#5B7586] flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#45C512] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#162E3D]">Fixed Master Design:</span>{" "}
              The background polygons, green ribbon, olive pill with icons, B&amp;Y logo, and QR code are locked to the uploaded reference card. Only the text changes.
            </div>
          </div>
        </div>

        {/* Right Panel: Live Card Preview Matching Master Reference */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-[#DDEAE2] p-6 shadow-by">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDEAE2] mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#45C512] animate-pulse" />
                <h3 className="text-sm font-bold text-[#162E3D]">
                  Live Visual Preview (Exact Master Template)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#5B7586] bg-[#F5F9F7] px-2 py-0.5 rounded border border-[#DDEAE2]">
                Ratio 2:1 &bull; 1024&times;512 px
              </span>
            </div>

            {/* Hint bar */}
            <div className="mb-3 px-3 py-1.5 bg-[#45C512]/10 border border-[#45C512]/30 rounded-xl flex items-center justify-between text-[11px] text-[#162E3D]">
              <span className="flex items-center gap-1.5 font-medium">
                <Edit3 className="w-3.5 h-3.5 text-[#45C512]" />
                <strong>Direct On-Card Editing:</strong> Click any word directly on the card to edit in-place!
              </span>
              <span className="text-[10px] text-[#5B7586]">Fixed Background &bull; Editable Words</span>
            </div>

            {/* VISITING CARD PREVIEW CONTAINER */}
            <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-300 bg-black aspect-[2/1] group select-none">
              {/* Fixed Master Template Image */}
              <img
                src="/visiting-card-blank.png"
                alt="Uploaded Master Visiting Card Template"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              />

              {/* OVERLAY 1: Top Ribbon Name & Designation (Directly Interactive) */}
              <div
                className="absolute flex flex-col justify-center items-center text-center"
                style={{
                  left: "20.5%",
                  top: "11%",
                  width: "36.5%",
                  height: "21%",
                }}
              >
                {/* Employee Name Input on Card */}
                <input
                  type="text"
                  value={cardData.name}
                  onChange={(e) =>
                    setCardData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  onFocus={() => setActiveField("name")}
                  onBlur={() => setActiveField(null)}
                  placeholder="Employee Name"
                  title="Click to edit Employee Name directly on the card"
                  className="w-full text-center bg-transparent border border-transparent hover:border-white/50 focus:border-[#45C512] focus:bg-black/30 rounded px-1 text-white font-extrabold leading-none tracking-tight outline-none transition-all placeholder:text-white/60 drop-shadow-sm"
                  style={{
                    fontSize: "clamp(13px, 3.3vw, 24px)",
                    fontFamily:
                      "Arial, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                />

                {/* Designation Input on Card */}
                <input
                  type="text"
                  value={cardData.designation}
                  onChange={(e) =>
                    setCardData((prev) => ({ ...prev, designation: e.target.value }))
                  }
                  onFocus={() => setActiveField("designation")}
                  onBlur={() => setActiveField(null)}
                  placeholder="Job Designation"
                  title="Click to edit Designation directly on the card"
                  className="w-full text-center bg-transparent border border-transparent hover:border-[#1b2817]/50 focus:border-[#45C512] focus:bg-white/40 rounded px-1 text-[#1b2817] font-bold leading-tight mt-1 outline-none transition-all placeholder:text-[#1b2817]/60"
                  style={{
                    fontSize: "clamp(7.5px, 1.7vw, 12.5px)",
                    fontFamily:
                      "Arial, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                />
              </div>

              {/* OVERLAY 2: Contact Information on Black Polygon (Directly Interactive) */}
              <div
                className="absolute flex flex-col justify-between"
                style={{
                  left: "11.2%",
                  top: "48%",
                  width: "35%",
                  height: "48%",
                }}
              >
                {/* Row 1: Phone */}
                <div className="flex items-center">
                  <input
                    type="text"
                    value={cardData.phone}
                    onChange={(e) =>
                      setCardData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    onFocus={() => setActiveField("phone")}
                    onBlur={() => setActiveField(null)}
                    placeholder="Phone Number"
                    title="Click to edit Phone number directly on the card"
                    className="w-full bg-transparent border border-transparent hover:border-white/50 focus:border-[#45C512] focus:bg-black/50 rounded px-1 -mx-1 text-white font-bold tracking-wide outline-none transition-all placeholder:text-white/60"
                    style={{
                      fontSize: "clamp(8px, 1.8vw, 13.5px)",
                      fontFamily:
                        "Arial, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  />
                </div>

                {/* Row 2: Email */}
                <div className="flex items-center">
                  <input
                    type="text"
                    value={cardData.email}
                    onChange={(e) =>
                      setCardData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    onFocus={() => setActiveField("email")}
                    onBlur={() => setActiveField(null)}
                    placeholder="Email Address"
                    title="Click to edit Email directly on the card"
                    className="w-full bg-transparent border border-transparent hover:border-white/50 focus:border-[#45C512] focus:bg-black/50 rounded px-1 -mx-1 text-white font-bold outline-none transition-all placeholder:text-white/60"
                    style={{
                      fontSize: "clamp(7px, 1.6vw, 12px)",
                      fontFamily:
                        "Arial, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  />
                </div>

                {/* Row 3: Website */}
                <div className="flex items-center">
                  <input
                    type="text"
                    value={cardData.website}
                    onChange={(e) =>
                      setCardData((prev) => ({ ...prev, website: e.target.value }))
                    }
                    onFocus={() => setActiveField("website")}
                    onBlur={() => setActiveField(null)}
                    placeholder="Website URL"
                    title="Click to edit Website directly on the card"
                    className="w-full bg-transparent border border-transparent hover:border-white/50 focus:border-[#45C512] focus:bg-black/50 rounded px-1 -mx-1 text-white font-bold outline-none transition-all placeholder:text-white/60"
                    style={{
                      fontSize: "clamp(7px, 1.6vw, 12px)",
                      fontFamily:
                        "Arial, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  />
                </div>

                {/* Row 4: Office Address */}
                <div className="flex flex-col justify-center">
                  <textarea
                    rows={2}
                    value={cardData.address}
                    onChange={(e) =>
                      setCardData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    onFocus={() => setActiveField("address")}
                    onBlur={() => setActiveField(null)}
                    placeholder="Office Address"
                    title="Click to edit Address directly on the card"
                    className="w-full bg-transparent border border-transparent hover:border-white/50 focus:border-[#45C512] focus:bg-black/50 rounded px-1 -mx-1 text-white font-bold leading-tight outline-none resize-none transition-all placeholder:text-white/60"
                    style={{
                      fontSize: "clamp(6.5px, 1.4vw, 10.5px)",
                      fontFamily:
                        "Arial, Helvetica, -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Template Specs Badge Row */}
            <div className="mt-4 pt-4 border-t border-[#DDEAE2] flex flex-wrap items-center justify-between text-xs text-[#5B7586] gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#162E3D]">Master Template:</span>
                <span>Exact Uploaded Background &bull; Fixed Logo &bull; QR Code &bull; Icons</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#45C512] font-semibold">
                <span>Print-Ready: 300 DPI (2048&times;1024)</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON BAR: PREVIEW, DOWNLOAD PNG, DOWNLOAD PDF */}
          <div className="bg-white rounded-2xl border border-[#DDEAE2] p-4 shadow-by flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleGenerateCard}
              disabled={isGenerating}
              className="flex-1 w-full py-3 px-4 bg-[#45C512] hover:bg-[#3db010] text-[#162E3D] font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Eye className="w-4 h-4 text-[#162E3D]" />
              <span>{isGenerating ? "GENERATING..." : "PREVIEW CARD"}</span>
            </button>

            <button
              onClick={handleDownloadPng}
              className="w-full sm:w-auto py-3 px-4 bg-[#162E3D] hover:bg-[#244254] text-[#45C512] font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="w-full sm:w-auto py-3 px-4 bg-white hover:bg-gray-50 text-[#162E3D] font-bold text-xs rounded-xl border border-[#DDEAE2] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4 text-[#162E3D]" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full sm:w-auto py-3 px-3 bg-[#F5F9F7] hover:bg-[#DDEAE2] text-[#162E3D] font-bold text-xs rounded-xl border border-[#DDEAE2] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Print standard business card"
            >
              <Printer className="w-4 h-4 text-[#162E3D]" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* PREVIEW & GENERATION MODAL */}
      {isGeneratedModalOpen && generatedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-[#162E3D] border border-white/20 rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between text-white pb-3 border-b border-white/15">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#45C512] text-[#162E3D]">
                    ✓ GENERATED FROM MASTER TEMPLATE
                  </span>
                  <span className="text-xs text-white/60 font-mono">
                    2048 &times; 1024 px &bull; 300 DPI High-Quality
                  </span>
                </div>
                <h3 className="text-lg font-bold font-serif uppercase tracking-wider mt-1 text-white">
                  Visiting Card &bull; {cardData.name} ({cardData.designation})
                </h3>
              </div>
              <button
                onClick={() => setIsGeneratedModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Render */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black aspect-[2/1]">
              <img
                src={generatedImageUrl}
                alt="Generated Visiting Card"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-white/70">
                Template background design and colors are 100% identical to your uploaded reference.
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-[#45C512]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied!" : "Copy Image"}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-[#162E3D] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:bg-gray-100"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print (3.5 &times; 2 in)</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 text-[#162E3D] text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#162E3D]" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={handleDownloadPng}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#45C512] hover:bg-[#3db010] text-[#162E3D] text-xs font-extrabold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG (2048&times;1024)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
