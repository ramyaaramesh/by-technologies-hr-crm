import { NextRequest, NextResponse } from "next/server";
import { getLoginLogs, clearLoginLogs, deleteLoginLog } from "@/lib/db";

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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const deleted = deleteLoginLog(id);
      return NextResponse.json({ success: true, deleted });
    } else {
      clearLoginLogs();
      return NextResponse.json({ success: true, message: "All login logs cleared" });
    }
  } catch (error) {
    console.error("DELETE /api/logs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete login logs" },
      { status: 500 }
    );
  }
}
