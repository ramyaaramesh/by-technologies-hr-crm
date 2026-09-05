// Comprehensive E2E HTTP verification test against http://localhost:3000

const BASE = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("   B & Y TECHNOLOGIES - UPDATED E2E TEST SUITE    ");
  console.log("==================================================");

  // 1. Root page HTML
  console.log("\n1. Testing Frontend Home Page...");
  const pageRes = await fetch(`${BASE}/`);
  assert(pageRes.status === 200, "Home page loaded with status 200");
  const html = await pageRes.text();
  assert(
    html.includes("B &amp; Y TECHNOLOGIES") || html.includes("B & Y TECHNOLOGIES"),
    "Page contains brand name B & Y TECHNOLOGIES"
  );

  // 2. Admin Login
  console.log("\n2. Testing HR Admin Authentication...");
  const adminLoginRes = await fetch(`${BASE}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "admin", username: "admin", password: "admin123" }),
  });
  const adminData = await adminLoginRes.json();
  assert(adminLoginRes.status === 200 && adminData.success === true, "HR Admin login succeeds with valid credentials");

  // 3. Employee Login by Employee ID (NO EMAIL NEEDED)
  console.log("\n3. Testing Employee Login by Employee ID (No Email Required)...");
  const empLoginByIdRes = await fetch(`${BASE}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "E2E-Automated-Test-Browser" },
    body: JSON.stringify({
      role: "employee",
      identifier: "BYT-101", // Login with Employee ID!
      password: "password123",
    }),
  });
  const empByIdData = await empLoginByIdRes.json();
  assert(
    empLoginByIdRes.status === 200 && empByIdData.success === true,
    "Employee successfully logged in using Employee ID 'BYT-101' without email"
  );
  assert(
    empByIdData.employee.empId === "BYT-101" && empByIdData.employee.designation === "Managing Director",
    `Employee profile for ID login resolved correctly (empId: ${empByIdData.employee.empId}, designation: ${empByIdData.employee.designation})`
  );

  // 4. Employee Login by Name (Fallback / Alternative)
  console.log("\n4. Testing Employee Login by Full Name...");
  const empLoginByNameRes = await fetch(`${BASE}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "employee",
      identifier: "Rahul Verma", // Login with Full Name!
      password: "password123",
    }),
  });
  const empByNameData = await empLoginByNameRes.json();
  assert(
    empLoginByNameRes.status === 200 && empByNameData.success === true,
    "Employee successfully logged in using Name 'Rahul Verma' without email"
  );
  assert(
    empByNameData.employee.empId === "BYT-106" && empByNameData.employee.designation === "BDM",
    `Profile for Rahul Verma (BYT-106, BDM) resolved correctly`
  );

  // 5. Inactive Employee Login Block by ID
  console.log("\n5. Testing Inactive Employee Login Block by Employee ID...");
  const inactiveLoginRes = await fetch(`${BASE}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "employee",
      identifier: "BYT-114", // Inactive employee ID (Meera Iyer)!
      password: "password123",
    }),
  });
  const inactiveData = await inactiveLoginRes.json();
  assert(
    inactiveLoginRes.status === 403 && inactiveData.success === false,
    "Inactive employee (BYT-114) login rejected with 403 Forbidden"
  );
  assert(
    inactiveData.error.includes("INACTIVE"),
    "Rejection message explicitly states account is INACTIVE"
  );

  // 6. Verify All 14 Official Agency Designations in Directory
  console.log("\n6. Testing All 14 Official Agency Designations...");
  const empListRes = await fetch(`${BASE}/api/employees`);
  const empListData = await empListRes.json();
  assert(empListRes.status === 200 && empListData.success === true, "Employees API returned 200 OK");
  assert(empListData.employees.length >= 14, `Employees list contains ${empListData.employees.length} records (>= 14)`);

  const expectedDesignations = [
    "General Manager",
    "Sr BDM",
    "Tech Team Manager",
    "Customer Support",
    "UI/UX Developer",
    "Sr SEO Analyst",
    "SEO Analyst",
    "FullStack Developer",
    "Managing Director",
    "HR",
    "Team Leader (Telecaller)",
    "Process Associate",
    "BDE",
    "BDM",
  ];

  const presentDesignations = empListData.employees.map((e) => e.designation.toLowerCase());
  let allDesignationsFound = true;
  for (const des of expectedDesignations) {
    const found = presentDesignations.includes(des.toLowerCase());
    if (!found) {
      allDesignationsFound = false;
      console.error(`  Missing designation in active roster: ${des}`);
    }
  }
  assert(allDesignationsFound, "All 14 official agency designations are active in the employee roster");

  // 7. Check Login Times Audit Log (Section 4)
  console.log("\n7. Testing Login Times Audit Log (Section 4)...");
  const logsRes = await fetch(`${BASE}/api/logs`);
  const logsData = await logsRes.json();
  assert(logsRes.status === 200 && logsData.success === true, "Login logs API responds 200");
  const recentLog = logsData.logs[0];
  assert(
    recentLog && (recentLog.empId === "BYT-101" || recentLog.empId === "BYT-106"),
    `Latest login audit recorded employee ID: ${recentLog?.empId} (${recentLog?.employeeName})`
  );

  // 8. Monthly Attendance Report - Excel Stream (.xls)
  console.log("\n8. Testing Monthly Attendance Report - Direct Excel Stream (.xls)...");
  const excelRes = await fetch(`${BASE}/api/attendance/export?month=2026-09&format=excel`);
  assert(excelRes.status === 200, "Excel export endpoint responded 200 OK");
  const contentType = excelRes.headers.get("content-type") || "";
  assert(
    contentType.includes("vnd.ms-excel"),
    `Content-Type is Excel spreadsheet stream (${contentType})`
  );
  const disposition = excelRes.headers.get("content-disposition") || "";
  assert(
    disposition.includes("BY_Technologies_Attendance_2026-09.xls"),
    `Content-Disposition attachment filename set properly: ${disposition}`
  );
  const excelXml = await excelRes.text();
  assert(
    excelXml.includes("Monthly Summary") &&
      excelXml.includes("Daily Attendance Matrix") &&
      excelXml.includes("Detailed Attendance Logs"),
    "Excel workbook contains all 3 structured worksheets: Summary, Matrix, and Logs"
  );
  assert(
    excelXml.includes("B &amp; Y TECHNOLOGIES"),
    "Excel workbook contains B & Y Technologies brand header"
  );

  // 9. Monthly Attendance Report - CSV Stream (.csv)
  console.log("\n9. Testing Monthly Attendance Report - CSV Stream (.csv)...");
  const csvRes = await fetch(`${BASE}/api/attendance/export?month=2026-09&format=csv`);
  assert(csvRes.status === 200, "CSV export endpoint responded 200 OK");
  const csvBuffer = await csvRes.arrayBuffer();
  const bytes = new Uint8Array(csvBuffer);
  const hasBom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  const csvText = new TextDecoder("utf-8").decode(csvBuffer);
  assert(
    csvText.includes("SECTION 1: MONTHLY EMPLOYEE SUMMARY") &&
      csvText.includes("SECTION 2: DAILY ATTENDANCE MATRIX") &&
      csvText.includes("SECTION 3: DETAILED TIME LOGS"),
    "CSV stream contains all 3 reporting sections"
  );
  assert(
    hasBom,
    `CSV stream includes UTF-8 BOM (0xEF, 0xBB, 0xBF) for seamless Microsoft Excel opening`
  );

  // 10. Save Monthly Attendance Report directly to Server Folder as Stream
  console.log("\n10. Testing Saving Report to Server Folder as Stream...");
  const saveFolderRes = await fetch(`${BASE}/api/attendance/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ month: "2026-09", format: "excel" }),
  });
  const saveFolderData = await saveFolderRes.json();
  assert(
    saveFolderRes.status === 200 && saveFolderData.success === true,
    `Excel attendance report successfully streamed and saved into folder: ${saveFolderData.report?.relativePath}`
  );
  assert(
    saveFolderData.report?.sizeBytes > 1000,
    `Saved Excel report has valid file size (${saveFolderData.report?.sizeFormatted})`
  );

  // 11. List Saved Reports in Server Folders
  console.log("\n11. Testing Listing Saved Reports in Server Folders...");
  const listReportsRes = await fetch(`${BASE}/api/attendance/reports`);
  const listReportsData = await listReportsRes.json();
  assert(
    listReportsRes.status === 200 && listReportsData.success === true,
    `Reports archive API responded 200 with ${listReportsData.reports?.length} files in folders`
  );
  assert(
    listReportsData.reports.some((r) => r.month === "2026-09" && r.format === "excel"),
    "Saved 2026-09 Excel file is indexed in server folder catalog"
  );

  // 12. Stream Saved Report from Server Folder
  console.log("\n12. Testing Streaming Report from Server Folder to Client...");
  const firstSaved = listReportsData.reports[0];
  const streamFromFolderRes = await fetch(`${BASE}${firstSaved.downloadUrl}`);
  assert(
    streamFromFolderRes.status === 200,
    `Stream from folder endpoint returned status 200 for ${firstSaved.fileName}`
  );
  const streamContentType = streamFromFolderRes.headers.get("content-type") || "";
  assert(
    streamContentType.includes("vnd.ms-excel") || streamContentType.includes("text/csv"),
    `Stream content type valid: ${streamContentType}`
  );
  const streamBytes = await streamFromFolderRes.arrayBuffer();
  assert(
    streamBytes.byteLength === firstSaved.sizeBytes,
    `Streamed byte length (${streamBytes.byteLength}) matches saved file on disk (${firstSaved.sizeBytes})`
  );

  // 13. Employee Creation with Official Designation (NO EMAIL NEEDED)
  console.log("\n13. Testing Employee Creation with Official Designation (No Email)...");
  const newEmpRes = await fetch(`${BASE}/api/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Sanjay Rajan",
      phone: "+91 98409 11224",
      designation: "Tech Team Manager",
      department: "Web & Tech Engineering",
      dateOfJoining: "2026-09-01",
      status: "active",
      password: "sanjaypass123",
      // Zero email provided!
    }),
  });
  const newEmpData = await newEmpRes.json();
  assert(
    newEmpRes.status === 201 && newEmpData.success === true,
    "Employee created successfully with 'Tech Team Manager' designation and ZERO email ID required"
  );
  const sanjayEmpId = newEmpData.employee.empId;
  const sanjayInternalId = newEmpData.employee.id;

  // Test Sanjay logging in immediately with his new Employee ID!
  const sanjayLoginRes = await fetch(`${BASE}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "employee",
      identifier: sanjayEmpId,
      password: "sanjaypass123",
    }),
  });
  const sanjayLoginData = await sanjayLoginRes.json();
  assert(
    sanjayLoginRes.status === 200 && sanjayLoginData.success === true,
    `Newly created employee Sanjay (${sanjayEmpId}) logged in successfully with Employee ID`
  );

  // Clean up Sanjay
  await fetch(`${BASE}/api/employees/${sanjayInternalId}`, { method: "DELETE" });

  // 14. Attendance Month-wise Matrix & Edit Type Verification
  console.log("\n14. Testing Month-wise Attendance Matrix & Edit Type...");
  const editAttRes = await fetch(`${BASE}/api/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employeeId: "emp_1",
      date: "2026-09-18",
      status: "Half day",
      workType: "Remote (WFH)",
      checkInTime: "09:30 AM",
      checkOutTime: "01:45 PM",
      notes: "Approved remote half-day for medical checkup",
    }),
  });
  const editAttData = await editAttRes.json();
  assert(
    editAttRes.status === 200 && editAttData.success === true,
    "Attendance record updated with status 'Half day' and workType 'Remote (WFH)'"
  );
  assert(
    editAttData.attendance.workType === "Remote (WFH)" && editAttData.attendance.status === "Half day",
    "Returned attendance record contains customized status and workType"
  );

  // Fetch month attendance
  const monthAttRes = await fetch(`${BASE}/api/attendance?month=2026-09`);
  const monthAttData = await monthAttRes.json();
  assert(
    monthAttRes.status === 200 && monthAttData.success === true && Array.isArray(monthAttData.attendance),
    `Fetched monthly attendance records for 2026-09 (${monthAttData.attendance.length} records)`
  );
  const foundRec = monthAttData.attendance.find((a) => a.employeeId === "emp_1" && a.date === "2026-09-18");
  assert(
    foundRec && foundRec.status === "Half day" && foundRec.workType === "Remote (WFH)",
    "Verified modified shift and type persisted in monthly calendar dataset"
  );

  // 15. HR Workspace Excel Master & Word Documents Generation
  console.log("\n15. Testing HR Workspace Excel Master & Word Document Generation...");
  const excelMasterRes = await fetch(`${BASE}/api/workspace/download?generate=excel-master`);
  assert(
    excelMasterRes.status === 200,
    "HR Workspace Excel Master (.xls) stream endpoint returned status 200"
  );
  const excelMasterContent = await excelMasterRes.text();
  assert(
    excelMasterContent.includes("B &amp; Y Technologies") &&
      excelMasterContent.includes("Employee Directory Master") &&
      excelMasterContent.includes("BYT-101"),
    "Excel Master contains company branding and full employee roster XML sheets"
  );

  // Word Document Stream: Appointment Letter
  const wordDocRes = await fetch(`${BASE}/api/workspace/download?generate=appointment-letter&empId=emp_1`);
  assert(
    wordDocRes.status === 200,
    "HR Workspace Word (.doc) Appointment Letter endpoint returned status 200"
  );
  const wordDocContent = await wordDocRes.text();
  assert(
    wordDocContent.includes("LETTER OF APPOINTMENT") &&
      wordDocContent.includes("B &amp; Y TECHNOLOGIES") &&
      wordDocContent.includes("Managing Director"),
    "Word Appointment Letter correctly populated with employee data and designation"
  );

  // 16. HR Workspace Vault Persistence Stream
  console.log("\n16. Testing HR Workspace Vault Persistence Stream to Server Folder...");
  const saveVaultRes = await fetch(`${BASE}/api/workspace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docType: "master-excel" }),
  });
  const saveVaultData = await saveVaultRes.json();
  assert(
    saveVaultRes.status === 200 && saveVaultData.success === true,
    `Saved Excel Master to HR Vault: ${saveVaultData.file?.fileName}`
  );

  const listVaultRes = await fetch(`${BASE}/api/workspace`);
  const listVaultData = await listVaultRes.json();
  assert(
    listVaultRes.status === 200 && Array.isArray(listVaultData.files),
    `HR Vault repository contains ${listVaultData.files?.length} archived documents`
  );

  // 17. Team Connect Chat Channels
  console.log("\n17. Testing Team Connect Chat Channels...");
  const channelsRes = await fetch(`${BASE}/api/chat/channels`);
  const channelsData = await channelsRes.json();
  assert(
    channelsRes.status === 200 && channelsData.success === true && Array.isArray(channelsData.channels),
    `Fetched ${channelsData.channels.length} team chat channels`
  );
  const generalChannel = channelsData.channels.find((c) => c.id === "general");
  assert(
    generalChannel && generalChannel.name === "#general",
    "Default group channel #general is active and accessible to all staff"
  );

  // 18. Team Connect Group Message, 1-on-1 DMs, & Unread Notifications
  console.log("\n18. Testing Team Connect DMs, Group Chat, & Unread Notifications...");
  // Post message to #general
  const postGroupRes = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderId: "admin",
      senderName: "HR Administrator",
      senderRole: "admin",
      senderDesignation: "HR Administration",
      channelId: "general",
      text: "Welcome to B & Y Technologies Team Connect! Chat is now live for all 14 agency roles.",
    }),
  });
  const postGroupData = await postGroupRes.json();
  assert(
    postGroupRes.status === 201 && postGroupData.success === true,
    "HR Admin posted announcement to #general channel successfully"
  );

  // Post 1-on-1 DM from HR Admin to Employee emp_1 (Anand Kumar)
  const postDmRes = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderId: "admin",
      senderName: "HR Administrator",
      senderRole: "admin",
      senderDesignation: "HR Administration",
      recipientId: "emp_1",
      text: "Hi Anand, your executive monthly review dossier is ready in the HR Vault.",
    }),
  });
  const postDmData = await postDmRes.json();
  assert(
    postDmRes.status === 201 && postDmData.success === true,
    "HR Admin sent 1-on-1 Direct Message to Anand Kumar (emp_1)"
  );

  // Check unread count for Anand (emp_1)
  const unreadRes = await fetch(`${BASE}/api/chat?userId=emp_1&countOnly=true`);
  const unreadData = await unreadRes.json();
  assert(
    unreadRes.status === 200 && unreadData.success === true && unreadData.bySender["admin"] >= 1,
    `Unread notification active for Anand: ${unreadData.bySender["admin"]} new message(s) from HR Admin`
  );

  // Mark messages as read by Anand
  const readRes = await fetch(`${BASE}/api/chat/read`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "emp_1", senderId: "admin" }),
  });
  const readData = await readRes.json();
  assert(
    readRes.status === 200 && readData.success === true,
    "Marked DM conversation as read successfully"
  );

  // Verify unread count reset for admin DMs
  const unreadAfterRes = await fetch(`${BASE}/api/chat?userId=emp_1&countOnly=true`);
  const unreadAfterData = await unreadAfterRes.json();
  assert(
    unreadAfterRes.status === 200 && (!unreadAfterData.bySender["admin"] || unreadAfterData.bySender["admin"] === 0),
    "Unread DM counter correctly cleared after viewing the conversation"
  );

  console.log("\n==================================================");
  console.log(`ALL TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("E2E Test encountered unexpected error:", err);
  process.exit(1);
});
