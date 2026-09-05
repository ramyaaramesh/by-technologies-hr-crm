import { NextRequest, NextResponse } from "next/server";
import { getLoginLogs } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    let logs = getLoginLogs(limit);

    if (search) {
      logs = logs.filter(
        (l) =>
          l.employeeName.toLowerCase().includes(search) ||
          (l.empId && l.empId.toLowerCase().includes(search)) ||
          (l.email && l.email.toLowerCase().includes(search)) ||
          l.ipAddress.includes(search)
      );
    }

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("GET /api/logs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch login logs" },
      { status: 500 }
    );
  }
}
