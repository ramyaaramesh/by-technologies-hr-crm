import fs from "fs";
import path from "path";
import os from "os";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { getEmployees, getAttendance, getLeaves } from "./db";
import { Employee } from "./types";

export const WORKSPACE_BASE_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "workspace")
  : path.join(process.cwd(), "workspace");

export interface WorkspaceFileMetadata {
  fileName: string;
  category: "excel" | "word";
  docType: "master_roster" | "appointment_letter" | "employee_dossier" | "nda_agreement";
  employeeName?: string;
  empId?: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  relativePath: string;
  downloadUrl: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ensureWorkspaceDirs() {
  const excelDir = path.join(WORKSPACE_BASE_DIR, "excel");
  const wordDir = path.join(WORKSPACE_BASE_DIR, "word");
  if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });
  if (!fs.existsSync(wordDir)) fs.mkdirSync(wordDir, { recursive: true });
}

// =========================================================================
// 1. EXCEL EMPLOYEE MASTER DATA WORKBOOK GENERATOR
// =========================================================================

export function generateEmployeeMasterExcel(): { xml: string; fileName: string } {
  const employees = getEmployees();
  const allAttendance = getAttendance();
  const allLeaves = getLeaves();
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `BY_Technologies_Employee_Master_${dateStr}.xls`;

  // Calculate department distributions
  const deptCounts: Record<string, number> = {};
  employees.forEach((e) => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>B &amp; Y Technologies HR Admin</Author>
  <Company>B &amp; Y Technologies</Company>
  <Title>Employee Master Data Directory</Title>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="BrandTitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Georgia" ss:Size="18" ss:Bold="1" ss:Color="#331E1E"/>
   <Interior ss:Color="#A2FC4B" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SubTitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Italic="1" ss:Color="#706161"/>
  </Style>
  <Style ss:ID="HeaderRow">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A89898"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A89898"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#331E1E" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellBold">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#331E1E"/>
  </Style>
  <Style ss:ID="CellLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10"/>
  </Style>
  <Style ss:ID="CellCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10"/>
  </Style>
  <Style ss:ID="StatusActive">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#166534"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StatusInactive">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#991B1B"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
 </Styles>

 <!-- SHEET 1: EMPLOYEE MASTER ROSTER -->
 <Worksheet ss:Name="Employee Directory Master">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="90"/>
   <Column ss:Width="160"/>
   <Column ss:Width="180"/>
   <Column ss:Width="180"/>
   <Column ss:Width="110"/>
   <Column ss:Width="180"/>
   <Column ss:Width="100"/>
   <Column ss:Width="75"/>
   <Column ss:Width="120"/>

   <Row ss:Height="36">
    <Cell ss:MergeAcross="8" ss:StyleID="BrandTitle">
     <Data ss:Type="String">  B &amp; Y TECHNOLOGIES — EMPLOYEE MASTER DATA ROSTER</Data>
    </Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="8" ss:StyleID="SubTitle">
     <Data ss:Type="String">  HR Workspace Export | Date: ${dateStr} | Total Staff: ${employees.length}</Data>
    </Cell>
   </Row>
   <Row ss:Height="12"></Row>

   <Row ss:Height="26">
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Employee ID</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Full Name</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Official Designation</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Department</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Phone Number</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Work Email</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Date of Joining</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Tenure (Approx)</Data></Cell>
   </Row>`;

  employees.forEach((emp) => {
    const joinYear = new Date(emp.dateOfJoining).getFullYear();
    const tenureYears = new Date().getFullYear() - joinYear;
    const tenureStr = tenureYears <= 0 ? "< 1 Year" : `${tenureYears}+ Year${tenureYears > 1 ? "s" : ""}`;

    xml += `
   <Row ss:Height="22">
    <Cell ss:StyleID="CellBold"><Data ss:Type="String">${emp.empId}</Data></Cell>
    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${emp.name}</Data></Cell>
    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${emp.designation}</Data></Cell>
    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${emp.department}</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${emp.phone}</Data></Cell>
    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${emp.email || "—"}</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${emp.dateOfJoining}</Data></Cell>
    <Cell ss:StyleID="${emp.status === "active" ? "StatusActive" : "StatusInactive"}"><Data ss:Type="String">${emp.status.toUpperCase()}</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${tenureStr}</Data></Cell>
   </Row>`;
  });

  xml += `
  </Table>
 </Worksheet>

 <!-- SHEET 2: DEPARTMENT BREAKDOWN -->
 <Worksheet ss:Name="Department Distribution">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="220"/>
   <Column ss:Width="120"/>
   <Column ss:Width="140"/>

   <Row ss:Height="30">
    <Cell ss:MergeAcross="2" ss:StyleID="BrandTitle">
     <Data ss:Type="String">  DEPARTMENT HEADCOUNT BREAKDOWN</Data>
    </Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Department Name</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Total Headcount</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">% of Total Staff</Data></Cell>
   </Row>`;

  Object.entries(deptCounts).forEach(([dept, count]) => {
    const pct = ((count / employees.length) * 100).toFixed(1);
    xml += `
   <Row ss:Height="22">
    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${dept}</Data></Cell>
    <Cell ss:StyleID="CellBold"><Data ss:Type="Number">${count}</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${pct}%</Data></Cell>
   </Row>`;
  });

  xml += `
  </Table>
 </Worksheet>
</Workbook>`;

  return { xml, fileName };
}

// =========================================================================
// 2. MICROSOFT WORD (.DOC) DOCUMENT GENERATORS
// =========================================================================

function generateWordWrapper(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 8.5in 11.0in;
      margin: 1.0in 1.0in 1.0in 1.0in;
      mso-header-margin: 0.5in;
      mso-footer-margin: 0.5in;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #331E1E;
      line-height: 1.6;
      font-size: 11pt;
      background-color: #ffffff;
      padding: 20px;
    }
    h1, h2, h3 {
      font-family: 'Georgia', serif;
      color: #331E1E;
      margin-bottom: 8px;
    }
    .header-table {
      width: 100%;
      border-bottom: 2pt solid #A2FC4B;
      padding-bottom: 12px;
      margin-bottom: 25px;
    }
    .brand-name {
      font-size: 20pt;
      font-weight: bold;
      letter-spacing: 2px;
      color: #331E1E;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 9pt;
      color: #706161;
      font-style: italic;
    }
    .badge {
      display: inline-block;
      background-color: #A2FC4B;
      color: #331E1E;
      padding: 4px 10px;
      font-size: 9pt;
      font-weight: bold;
      border-radius: 4px;
    }
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      color: #331E1E;
      border-bottom: 1pt solid #E2EAD6;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      margin-bottom: 20px;
    }
    table.data-table th {
      background-color: #331E1E;
      color: #ffffff;
      padding: 8px 12px;
      font-size: 10pt;
      text-align: left;
    }
    table.data-table td {
      border: 1pt solid #E2EAD6;
      padding: 8px 12px;
      font-size: 10pt;
    }
    .signature-box {
      margin-top: 50px;
      width: 100%;
    }
    .signature-line {
      border-top: 1pt solid #331E1E;
      width: 200px;
      margin-top: 40px;
      font-size: 10pt;
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td>
        <div class="brand-name">B &amp; Y TECHNOLOGIES</div>
        <div class="brand-sub">Digital Marketing Agency &bull; Chennai &bull; India</div>
      </td>
      <td style="text-align: right;">
        <span class="badge">OFFICIAL HR DOCUMENT</span>
      </td>
    </tr>
  </table>

  ${bodyHtml}

  <div style="margin-top: 40px; font-size: 8pt; color: #706161; text-align: center; border-top: 1pt solid #E2EAD6; padding-top: 10px;">
    B &amp; Y Technologies &bull; Confidential &bull; For Internal &amp; Employee Use Only
  </div>
</body>
</html>`;
}

// Generate Official Appointment Letter in Word (.doc)
export function generateAppointmentLetterWord(emp: Employee): { doc: string; fileName: string } {
  const today = new Date().toLocaleDateString("en-US", { dateStyle: "long" });
  const fileName = `Appointment_Letter_${emp.empId}_${emp.name.replace(/\s+/g, "_")}.doc`;

  const bodyHtml = `
    <div style="text-align: right; font-size: 10pt; margin-bottom: 20px;">
      <strong>Date:</strong> ${today}<br>
      <strong>Ref:</strong> BYT/HR/APPT/${new Date().getFullYear()}/${emp.empId}
    </div>

    <div style="margin-bottom: 20px;">
      <strong>To:</strong><br>
      <strong>${emp.name}</strong><br>
      Employee ID: ${emp.empId}<br>
      Contact: ${emp.phone}<br>
      ${emp.email ? `Email: ${emp.email}` : ""}
    </div>

    <h2 style="text-align: center; margin-bottom: 20px;">LETTER OF APPOINTMENT</h2>

    <p>Dear <strong>${emp.name}</strong>,</p>

    <p>
      On behalf of <strong>B &amp; Y Technologies</strong>, we are delighted to confirm your appointment for the position of 
      <strong>${emp.designation}</strong> in the <strong>${emp.department}</strong> department, effective from 
      <strong>${emp.dateOfJoining}</strong>.
    </p>

    <div class="section-title">1. Role &amp; Responsibilities</div>
    <p>
      In your capacity as <strong>${emp.designation}</strong>, you will report to the department head and executive management. 
      You will be expected to perform the duties associated with your role diligently and contribute to client campaigns, strategic 
      initiatives, and agency growth in alignment with our high performance benchmarks.
    </p>

    <div class="section-title">2. Place of Work &amp; Working Hours</div>
    <p>
      Your primary location of work will be the B &amp; Y Technologies Chennai Studio. Regular working hours are Monday through 
      Saturday, 9:30 AM to 6:30 PM, with flexibility as required by project milestones and client deliverables.
    </p>

    <div class="section-title">3. Portal Login Credentials</div>
    <p>
      Your primary identifier for self-service portal access, attendance check-ins, and leave management is:
    </p>
    <table class="data-table" style="max-width: 400px;">
      <tr>
        <th style="width: 50%;">Portal Login ID</th>
        <td><strong>${emp.empId}</strong></td>
      </tr>
      <tr>
        <th>Designation</th>
        <td>${emp.designation}</td>
      </tr>
      <tr>
        <th>Status</th>
        <td>Active Permanent</td>
      </tr>
    </table>

    <div class="section-title">4. Confidentiality &amp; IP Protection</div>
    <p>
      During and following your employment with B &amp; Y Technologies, you shall maintain strict confidentiality regarding all client 
      data, ad accounts, creative assets, software codes, strategies, and agency business operations.
    </p>

    <p>We welcome you to the B &amp; Y Technologies team and look forward to a mutually rewarding association.</p>

    <table class="signature-box">
      <tr>
        <td style="width: 50%;">
          Sincerely,<br>
          <strong>For B &amp; Y Technologies</strong>
          <div class="signature-line">
            <strong>Authorized Signatory</strong><br>
            Human Resources &amp; Operations
          </div>
        </td>
        <td style="width: 50%; text-align: right;">
          <div style="display: inline-block; text-align: left;">
            Accepted by:<br>
            <strong>${emp.name}</strong>
            <div class="signature-line">
              <strong>Employee Signature</strong><br>
              Date: ____________________
            </div>
          </div>
        </td>
      </tr>
    </table>
  `;

  return { doc: generateWordWrapper(`Appointment Letter - ${emp.name}`, bodyHtml), fileName };
}

// Generate Complete Employee Dossier in Word (.doc)
export function generateEmployeeDossierWord(emp: Employee): { doc: string; fileName: string } {
  const fileName = `Employee_Dossier_${emp.empId}_${emp.name.replace(/\s+/g, "_")}.doc`;
  const attendance = getAttendance().filter((a) => a.employeeId === emp.id);
  const leaves = getLeaves().filter((l) => l.employeeId === emp.id);

  let present = 0, late = 0, half = 0, absent = 0;
  attendance.forEach((a) => {
    if (a.status === "Present") present++;
    else if (a.status === "Late") late++;
    else if (a.status === "Half day") half++;
    else if (a.status === "Absent") absent++;
  });

  const bodyHtml = `
    <h2 style="text-align: center; margin-bottom: 5px;">EMPLOYEE DOSSIER &amp; SERVICE RECORD</h2>
    <div style="text-align: center; font-size: 10pt; color: #706161; margin-bottom: 25px;">
      B &amp; Y Technologies Human Resources Vault
    </div>

    <div class="section-title">1. Personal &amp; Employment Profile</div>
    <table class="data-table">
      <tr>
        <th style="width: 25%;">Employee ID</th>
        <td style="width: 25%;"><strong>${emp.empId}</strong></td>
        <th style="width: 25%;">Employment Status</th>
        <td style="width: 25%;"><strong>${emp.status.toUpperCase()}</strong></td>
      </tr>
      <tr>
        <th>Full Name</th>
        <td>${emp.name}</td>
        <th>Official Designation</th>
        <td><strong>${emp.designation}</strong></td>
      </tr>
      <tr>
        <th>Department</th>
        <td>${emp.department}</td>
        <th>Date of Joining</th>
        <td>${emp.dateOfJoining}</td>
      </tr>
      <tr>
        <th>Contact Number</th>
        <td>${emp.phone}</td>
        <th>Work Email</th>
        <td>${emp.email || "— (No email required)"}</td>
      </tr>
    </table>

    <div class="section-title">2. Lifetime Attendance Overview</div>
    <table class="data-table">
      <tr>
        <th>Total Logged Days</th>
        <th>Present Days</th>
        <th>Late Days</th>
        <th>Half Days</th>
        <th>Absent Days</th>
        <th>Approved Leaves</th>
      </tr>
      <tr style="text-align: center;">
        <td><strong>${attendance.length}</strong></td>
        <td style="color: #166534; font-weight: bold;">${present}</td>
        <td style="color: #854D0E;">${late}</td>
        <td style="color: #1E40AF;">${half}</td>
        <td style="color: #991B1B;">${absent}</td>
        <td style="color: #5B21B6; font-weight: bold;">${leaves.filter((l) => l.status === "Approved").length}</td>
      </tr>
    </table>

    <div class="section-title">3. Leave Application History</div>
    ${
      leaves.length === 0
        ? `<p style="font-size: 10pt; color: #706161;">No leave applications recorded for this staff member.</p>`
        : `<table class="data-table">
            <tr>
              <th>Type</th>
              <th>Period</th>
              <th>Days</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
            ${leaves
              .map(
                (l) => `<tr>
              <td>${l.leaveType}</td>
              <td>${l.fromDate} to ${l.toDate}</td>
              <td>${l.days}</td>
              <td><strong>${l.status}</strong></td>
              <td>${l.reason}</td>
            </tr>`
              )
              .join("")}
          </table>`
    }

    <div class="section-title">4. HR Verification &amp; Certification</div>
    <p style="font-size: 10pt;">
      This dossier is an authentic service record extracted from B &amp; Y Technologies HR management system. 
      All records therein are verified and maintained in accordance with company governance guidelines.
    </p>

    <div class="signature-line" style="margin-top: 40px;">
      <strong>Certified By: HR Department</strong><br>
      B &amp; Y Technologies
    </div>
  `;

  return { doc: generateWordWrapper(`Employee Dossier - ${emp.name}`, bodyHtml), fileName };
}

// Generate NDA Agreement in Word (.doc)
export function generateNdaAgreementWord(emp: Employee): { doc: string; fileName: string } {
  const fileName = `NDA_Agreement_${emp.empId}_${emp.name.replace(/\s+/g, "_")}.doc`;
  const today = new Date().toLocaleDateString("en-US", { dateStyle: "long" });

  const bodyHtml = `
    <h2 style="text-align: center; margin-bottom: 5px;">NON-DISCLOSURE &amp; CONFIDENTIALITY AGREEMENT</h2>
    <div style="text-align: center; font-size: 10pt; color: #706161; margin-bottom: 25px;">
      Digital Marketing Agency &bull; Client Data &bull; Proprietary Assets
    </div>

    <p>This Non-Disclosure Agreement ("Agreement") is executed on <strong>${today}</strong> by and between:</p>

    <p>
      <strong>B &amp; Y Technologies</strong>, a digital marketing agency having its registered office in Chennai ("Company"),<br>
      AND<br>
      <strong>${emp.name}</strong>, holding Employee ID <strong>${emp.empId}</strong>, currently engaged as <strong>${emp.designation}</strong> ("Employee").
    </p>

    <div class="section-title">1. Confidential Information Defined</div>
    <p>
      Confidential information includes, without limitation: client business data, digital marketing strategy blueprints, 
      Google Ads &amp; Meta Ads account access, conversion rate data, SEO keyword databases, proprietary agency software, 
      telecalling client databases, creative assets, and client compensation arrangements.
    </p>

    <div class="section-title">2. Obligations of Non-Disclosure</div>
    <p>
      The Employee agrees not to disclose, duplicate, transfer, or exploit any Confidential Information for personal benefit 
      or the benefit of any third-party during employment or subsequent to separation from the Company.
    </p>

    <div class="section-title">3. Return of Materials</div>
    <p>
      Upon termination or request, the Employee shall immediately return all documents, client credentials, laptops, digital files, 
      and correspondence belonging to the Company.
    </p>

    <table class="signature-box">
      <tr>
        <td style="width: 50%;">
          <strong>B &amp; Y Technologies</strong>
          <div class="signature-line">
            Authorized Executive Signature
          </div>
        </td>
        <td style="width: 50%; text-align: right;">
          <div style="display: inline-block; text-align: left;">
            <strong>${emp.name}</strong> (${emp.empId})
            <div class="signature-line">
              Employee Signature
            </div>
          </div>
        </td>
      </tr>
    </table>
  `;

  return { doc: generateWordWrapper(`NDA Agreement - ${emp.name}`, bodyHtml), fileName };
}

// =========================================================================
// 3. WORKSPACE STREAMING & DISK PERSISTENCE
// =========================================================================

export async function saveWorkspaceDocumentStream(
  docType: "master_roster" | "appointment_letter" | "employee_dossier" | "nda_agreement",
  empId?: string
): Promise<WorkspaceFileMetadata> {
  ensureWorkspaceDirs();

  let content: string;
  let fileName: string;
  let category: "excel" | "word";
  let targetDir: string;
  let empName: string | undefined;
  let employeeId: string | undefined;

  if (docType === "master_roster") {
    category = "excel";
    targetDir = path.join(WORKSPACE_BASE_DIR, "excel");
    const res = generateEmployeeMasterExcel();
    content = res.xml;
    fileName = res.fileName;
  } else {
    category = "word";
    targetDir = path.join(WORKSPACE_BASE_DIR, "word");
    const employees = getEmployees();
    const emp = employees.find((e) => e.empId === empId || e.id === empId) || employees[0];
    empName = emp.name;
    employeeId = emp.empId;

    if (docType === "appointment_letter") {
      const res = generateAppointmentLetterWord(emp);
      content = res.doc;
      fileName = res.fileName;
    } else if (docType === "employee_dossier") {
      const res = generateEmployeeDossierWord(emp);
      content = res.doc;
      fileName = res.fileName;
    } else {
      const res = generateNdaAgreementWord(emp);
      content = res.doc;
      fileName = res.fileName;
    }
  }

  const filePath = path.join(targetDir, fileName);

  // Write via stream pipeline
  const sourceStream = Readable.from(Buffer.from(content, "utf-8"));
  const destinationStream = fs.createWriteStream(filePath);
  await pipeline(sourceStream, destinationStream);

  const stats = fs.statSync(filePath);
  const relativePath = path.relative(WORKSPACE_BASE_DIR, filePath).replace(/\\/g, "/");

  return {
    fileName,
    category,
    docType,
    employeeName: empName,
    empId: employeeId,
    sizeBytes: stats.size,
    sizeFormatted: formatBytes(stats.size),
    createdAt: stats.mtime.toISOString(),
    relativePath,
    downloadUrl: `/api/workspace/download?file=${encodeURIComponent(relativePath)}`,
  };
}

// List all files in the workspace directory
export function getWorkspaceFiles(): WorkspaceFileMetadata[] {
  ensureWorkspaceDirs();
  const results: WorkspaceFileMetadata[] = [];

  function scan(dir: string, category: "excel" | "word") {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile()) {
        const fullPath = path.join(dir, entry.name);
        const stats = fs.statSync(fullPath);
        const relativePath = path.relative(WORKSPACE_BASE_DIR, fullPath).replace(/\\/g, "/");

        let docType: WorkspaceFileMetadata["docType"] = "master_roster";
        if (entry.name.includes("Appointment")) docType = "appointment_letter";
        else if (entry.name.includes("Dossier")) docType = "employee_dossier";
        else if (entry.name.includes("NDA")) docType = "nda_agreement";

        // Extract employee ID if present (e.g. BYT-101)
        const match = entry.name.match(/BYT-\d+/);
        const empId = match ? match[0] : undefined;

        results.push({
          fileName: entry.name,
          category,
          docType,
          empId,
          sizeBytes: stats.size,
          sizeFormatted: formatBytes(stats.size),
          createdAt: stats.mtime.toISOString(),
          relativePath,
          downloadUrl: `/api/workspace/download?file=${encodeURIComponent(relativePath)}`,
        });
      }
    }
  }

  scan(path.join(WORKSPACE_BASE_DIR, "excel"), "excel");
  scan(path.join(WORKSPACE_BASE_DIR, "word"), "word");

  return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Delete file from workspace
export function deleteWorkspaceFile(relativePath: string): boolean {
  try {
    const resolvedPath = path.resolve(WORKSPACE_BASE_DIR, relativePath);
    if (!resolvedPath.startsWith(path.resolve(WORKSPACE_BASE_DIR))) {
      throw new Error("Access denied");
    }
    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Delete workspace file error:", err);
    return false;
  }
}
