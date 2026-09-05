import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import {
  WORKSPACE_BASE_DIR,
  generateEmployeeMasterExcel,
  generateAppointmentLetterWord,
  generateEmployeeDossierWord,
  generateNdaAgreementWord,
} from "@/lib/hrDocuments";
import { getEmployees } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get("file");
    const generate = searchParams.get("generate");
    const empId = searchParams.get("empId") || undefined;

    // Mode 1: Stream directly generated document
    if (generate) {
      const genType = generate.toLowerCase().replace(/-/g, "_");
      if (genType === "master_roster" || genType === "excel_master" || genType === "master_excel") {
        const { xml, fileName } = generateEmployeeMasterExcel();
        return new NextResponse(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.ms-excel; charset=utf-8",
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Cache-Control": "no-cache",
          },
        });
      }

      const employees = getEmployees();
      const emp = employees.find((e) => e.empId === empId || e.id === empId) || employees[0];

      let doc = "";
      let fileName = "";

      if (genType === "appointment_letter") {
        const res = generateAppointmentLetterWord(emp);
        doc = res.doc;
        fileName = res.fileName;
      } else if (genType === "employee_dossier") {
        const res = generateEmployeeDossierWord(emp);
        doc = res.doc;
        fileName = res.fileName;
      } else if (genType === "nda_agreement") {
        const res = generateNdaAgreementWord(emp);
        doc = res.doc;
        fileName = res.fileName;
      }

      return new NextResponse(doc, {
        status: 200,
        headers: {
          "Content-Type": "application/msword; charset=utf-8",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Cache-Control": "no-cache",
        },
      });
    }

    // Mode 2: Stream existing file from workspace directory
    if (!file) {
      return new NextResponse("File or generate parameter required", { status: 400 });
    }

    const resolvedPath = path.resolve(WORKSPACE_BASE_DIR, file);
    if (
      !resolvedPath.startsWith(path.resolve(WORKSPACE_BASE_DIR)) ||
      !fs.existsSync(resolvedPath)
    ) {
      return new NextResponse("Document not found", { status: 404 });
    }

    const fileName = path.basename(resolvedPath);
    const isExcel = fileName.endsWith(".xls");
    const contentType = isExcel
      ? "application/vnd.ms-excel; charset=utf-8"
      : "application/msword; charset=utf-8";

    const nodeStream = fs.createReadStream(resolvedPath);
    const webStream = Readable.toWeb(nodeStream);

    return new NextResponse(webStream as any, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Workspace download error:", error);
    return new NextResponse("Failed to stream document", { status: 500 });
  }
}
