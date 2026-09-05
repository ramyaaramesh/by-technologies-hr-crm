import fs from "fs";
import path from "path";
import os from "os";
import {
  Employee,
  Attendance,
  LeaveRequest,
  LoginLog,
  JobOpening,
  AdminCredentials,
  ChatMessage,
  ChatChannel,
} from "./types";

interface DatabaseSchema {
  admin: AdminCredentials;
  employees: Employee[];
  attendance: Attendance[];
  leaves: LeaveRequest[];
  loginLogs: LoginLog[];
  jobs: JobOpening[];
  chatMessages: ChatMessage[];
  chatChannels: ChatChannel[];
}

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "database.json");
const VERCEL_TMP_PATH = path.join(os.tmpdir(), "by_technologies_database.json");

function getDbPath(): string {
  if (process.env.VERCEL) {
    return VERCEL_TMP_PATH;
  }
  return DEFAULT_DB_PATH;
}

// Helper to format dates YYYY-MM-DD
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTodayString(): string {
  return formatDate(new Date());
}

export function getDefaultChannels(): ChatChannel[] {
  const now = new Date().toISOString();
  return [
    {
      id: "general",
      name: "#general",
      description: "Company-wide announcements, agency updates & general discussions",
      isGroup: true,
      memberIds: ["all"],
      createdAt: now,
    },
    {
      id: "management",
      name: "#management",
      description: "Leadership team: Managing Director, GM, HR & Tech Leads",
      isGroup: true,
      memberIds: ["all"],
      createdAt: now,
    },
    {
      id: "tech-and-design",
      name: "#tech-and-design",
      description: "Engineering sprints, UI/UX designs, website builds & tech stack",
      isGroup: true,
      memberIds: ["all"],
      createdAt: now,
    },
    {
      id: "seo-and-growth",
      name: "#seo-and-growth",
      description: "SEO ranking reports, keyword strategies, content audits & campaigns",
      isGroup: true,
      memberIds: ["all"],
      createdAt: now,
    },
    {
      id: "sales-and-telecalling",
      name: "#sales-and-telecalling",
      description: "Client outreach, lead pipelines, telecalling scripts & closures",
      isGroup: true,
      memberIds: ["all"],
      createdAt: now,
    },
  ];
}

export function getDefaultMessages(): ChatMessage[] {
  const now = new Date();
  const dMinus1 = new Date(now.getTime() - 86400000);
  return [
    {
      id: "msg_init_1",
      senderId: "emp_1",
      senderName: "Anand Kumar",
      senderEmpId: "BYT-101",
      senderDesignation: "Managing Director",
      channelId: "general",
      text: "Welcome everyone to B & Y Technologies digital workspace! Please check your attendance and monthly targets.",
      timestamp: dMinus1.toISOString(),
      readBy: ["emp_1", "admin"],
    },
    {
      id: "msg_init_2",
      senderId: "emp_3",
      senderName: "Radhika Menon",
      senderEmpId: "BYT-103",
      senderDesignation: "HR",
      channelId: "general",
      text: "All staff: Monthly attendance calendar and documents are now accessible in Section 2.",
      timestamp: new Date(now.getTime() - 3600000 * 3).toISOString(),
      readBy: ["emp_3", "admin"],
    },
    {
      id: "msg_init_3",
      senderId: "emp_4",
      senderName: "Vikram Raman",
      senderEmpId: "BYT-104",
      senderDesignation: "Tech Team Manager",
      channelId: "tech-and-design",
      text: "New digital marketing client landing pages are deployed and ready for UI/UX audit.",
      timestamp: new Date(now.getTime() - 1800000).toISOString(),
      readBy: ["emp_4"],
    },
  ];
}

function generateSeedData(): DatabaseSchema {
  const today = new Date();
  const todayStr = formatDate(today);

  // Yesterday and earlier days
  const dMinus1 = new Date(today);
  dMinus1.setDate(today.getDate() - 1);
  const dMinus1Str = formatDate(dMinus1);

  const dMinus2 = new Date(today);
  dMinus2.setDate(today.getDate() - 2);
  const dMinus2Str = formatDate(dMinus2);

  const dMinus3 = new Date(today);
  dMinus3.setDate(today.getDate() - 3);
  const dMinus3Str = formatDate(dMinus3);

  const employees: Employee[] = [
    {
      id: "emp_1",
      empId: "BYT-101",
      name: "Anand Kumar",
      email: "anand@bytechnologies.com",
      phone: "+91 98401 11223",
      designation: "Managing Director",
      department: "Executive Leadership",
      dateOfJoining: "2021-01-10",
      status: "active",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      createdAt: "2021-01-10T09:00:00.000Z",
      updatedAt: "2021-01-10T09:00:00.000Z",
    },
    {
      id: "emp_2",
      empId: "BYT-102",
      name: "Kavitha Sundaram",
      email: "kavitha@bytechnologies.com",
      phone: "+91 98402 22334",
      designation: "General Manager",
      department: "Operations & Management",
      dateOfJoining: "2021-06-15",
      status: "active",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      createdAt: "2021-06-15T09:00:00.000Z",
      updatedAt: "2021-06-15T09:00:00.000Z",
    },
    {
      id: "emp_3",
      empId: "BYT-103",
      name: "Radhika Menon",
      email: "radhika@bytechnologies.com",
      phone: "+91 98403 33445",
      designation: "HR",
      department: "People Operations & HR",
      dateOfJoining: "2022-02-01",
      status: "active",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      createdAt: "2022-02-01T09:00:00.000Z",
      updatedAt: "2022-02-01T09:00:00.000Z",
    },
    {
      id: "emp_4",
      empId: "BYT-104",
      name: "Vikram Raman",
      email: "vikram@bytechnologies.com",
      phone: "+91 98404 44556",
      designation: "Tech Team Manager",
      department: "Web & Tech Engineering",
      dateOfJoining: "2022-05-10",
      status: "active",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      createdAt: "2022-05-10T09:00:00.000Z",
      updatedAt: "2022-05-10T09:00:00.000Z",
    },
    {
      id: "emp_5",
      empId: "BYT-105",
      name: "Karthik Venkat",
      email: "karthik.v@bytechnologies.com",
      phone: "+91 98405 55667",
      designation: "Sr BDM",
      department: "Business Development & Sales",
      dateOfJoining: "2022-08-15",
      status: "active",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
      createdAt: "2022-08-15T09:00:00.000Z",
      updatedAt: "2022-08-15T09:00:00.000Z",
    },
    {
      id: "emp_6",
      empId: "BYT-106",
      name: "Rahul Verma",
      email: "rahul@bytechnologies.com",
      phone: "+91 98406 66778",
      designation: "BDM",
      department: "Business Development & Sales",
      dateOfJoining: "2023-01-20",
      status: "active",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: "2023-01-20T09:00:00.000Z",
      updatedAt: "2023-01-20T09:00:00.000Z",
    },
    {
      id: "emp_7",
      empId: "BYT-107",
      name: "Pooja Nair",
      email: "pooja@bytechnologies.com",
      phone: "+91 98407 77889",
      designation: "BDE",
      department: "Business Development & Sales",
      dateOfJoining: "2023-03-15",
      status: "active",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      createdAt: "2023-03-15T09:00:00.000Z",
      updatedAt: "2023-03-15T09:00:00.000Z",
    },
    {
      id: "emp_8",
      empId: "BYT-108",
      name: "Priya Sharma",
      email: "priya@bytechnologies.com",
      phone: "+91 98408 88990",
      designation: "Team Leader (Telecaller)",
      department: "Client Outreach & Telecalling",
      dateOfJoining: "2023-04-10",
      status: "active",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      createdAt: "2023-04-10T09:00:00.000Z",
      updatedAt: "2023-04-10T09:00:00.000Z",
    },
    {
      id: "emp_9",
      empId: "BYT-109",
      name: "Dinesh Raj",
      email: "dinesh@bytechnologies.com",
      phone: "+91 98409 99001",
      designation: "Process Associate",
      department: "Client Outreach & Telecalling",
      dateOfJoining: "2023-07-01",
      status: "active",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      createdAt: "2023-07-01T09:00:00.000Z",
      updatedAt: "2023-07-01T09:00:00.000Z",
    },
    {
      id: "emp_10",
      empId: "BYT-110",
      name: "Arjun Swaminathan",
      email: "arjun@bytechnologies.com",
      phone: "+91 98410 10101",
      designation: "FullStack Developer",
      department: "Web & Tech Engineering",
      dateOfJoining: "2023-09-15",
      status: "active",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      createdAt: "2023-09-15T09:00:00.000Z",
      updatedAt: "2023-09-15T09:00:00.000Z",
    },
    {
      id: "emp_11",
      empId: "BYT-111",
      name: "Ananya Nair",
      email: "ananya@bytechnologies.com",
      phone: "+91 98411 11212",
      designation: "UI/UX Developer",
      department: "Creative Studio",
      dateOfJoining: "2023-10-01",
      status: "active",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      createdAt: "2023-10-01T09:00:00.000Z",
      updatedAt: "2023-10-01T09:00:00.000Z",
    },
    {
      id: "emp_12",
      empId: "BYT-112",
      name: "Suresh Prabhu",
      email: "suresh@bytechnologies.com",
      phone: "+91 98412 12323",
      designation: "Sr SEO Analyst",
      department: "SEO & Organic Growth",
      dateOfJoining: "2023-11-15",
      status: "active",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      createdAt: "2023-11-15T09:00:00.000Z",
      updatedAt: "2023-11-15T09:00:00.000Z",
    },
    {
      id: "emp_13",
      empId: "BYT-113",
      name: "Sneha Patel",
      email: "sneha@bytechnologies.com",
      phone: "+91 98413 13434",
      designation: "SEO Analyst",
      department: "SEO & Organic Growth",
      dateOfJoining: "2024-01-10",
      status: "active",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: "2024-01-10T09:00:00.000Z",
      updatedAt: "2024-01-10T09:00:00.000Z",
    },
    {
      id: "emp_14",
      empId: "BYT-114",
      name: "Meera Iyer",
      email: "meera@bytechnologies.com",
      phone: "+91 98414 14545",
      designation: "Customer Support",
      department: "Customer Support & Success",
      dateOfJoining: "2024-02-01",
      status: "inactive", // Inactive account for testing status checks
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      createdAt: "2024-02-01T09:00:00.000Z",
      updatedAt: "2024-02-01T09:00:00.000Z",
    },
  ];

  const attendance: Attendance[] = [
    // Today's records
    {
      id: "att_1",
      employeeId: "emp_1",
      date: todayStr,
      status: "Present",
      checkInTime: "09:12 AM",
      checkOutTime: "06:15 PM",
      notes: "In Office - Main Studio",
      createdAt: `${todayStr}T09:12:00.000Z`,
      updatedAt: `${todayStr}T18:15:00.000Z`,
    },
    {
      id: "att_2",
      employeeId: "emp_2",
      date: todayStr,
      status: "Late",
      checkInTime: "10:05 AM",
      checkOutTime: "06:45 PM",
      notes: "Client review call delay",
      createdAt: `${todayStr}T10:05:00.000Z`,
      updatedAt: `${todayStr}T18:45:00.000Z`,
    },
    {
      id: "att_3",
      employeeId: "emp_3",
      date: todayStr,
      status: "Half day",
      checkInTime: "09:30 AM",
      checkOutTime: "01:45 PM",
      notes: "Approved doctor appointment in PM",
      createdAt: `${todayStr}T09:30:00.000Z`,
      updatedAt: `${todayStr}T13:45:00.000Z`,
    },
    {
      id: "att_4",
      employeeId: "emp_4",
      date: todayStr,
      status: "Present",
      checkInTime: "09:05 AM",
      checkOutTime: "",
      notes: "Remote - Tech Sprint",
      createdAt: `${todayStr}T09:05:00.000Z`,
      updatedAt: `${todayStr}T09:05:00.000Z`,
    },
    {
      id: "att_5",
      employeeId: "emp_5",
      date: todayStr,
      status: "Absent",
      checkInTime: "",
      checkOutTime: "",
      notes: "Casual Leave applied",
      createdAt: `${todayStr}T09:00:00.000Z`,
      updatedAt: `${todayStr}T09:00:00.000Z`,
    },
    {
      id: "att_6",
      employeeId: "emp_6",
      date: todayStr,
      status: "Present",
      checkInTime: "09:10 AM",
      checkOutTime: "",
      notes: "Client meetings scheduled",
      createdAt: `${todayStr}T09:10:00.000Z`,
      updatedAt: `${todayStr}T09:10:00.000Z`,
    },
    // Past days records for Priya (emp_1)
    {
      id: "att_p1",
      employeeId: "emp_1",
      date: dMinus1Str,
      status: "Present",
      checkInTime: "09:15 AM",
      checkOutTime: "06:30 PM",
      notes: "Organic SEO Audit client report",
      createdAt: `${dMinus1Str}T09:15:00.000Z`,
      updatedAt: `${dMinus1Str}T18:30:00.000Z`,
    },
    {
      id: "att_p2",
      employeeId: "emp_1",
      date: dMinus2Str,
      status: "Present",
      checkInTime: "09:08 AM",
      checkOutTime: "06:12 PM",
      notes: "Content cluster launch",
      createdAt: `${dMinus2Str}T09:08:00.000Z`,
      updatedAt: `${dMinus2Str}T18:12:00.000Z`,
    },
    {
      id: "att_p3",
      employeeId: "emp_1",
      date: dMinus3Str,
      status: "Late",
      checkInTime: "09:55 AM",
      checkOutTime: "06:40 PM",
      notes: "Metro delay",
      createdAt: `${dMinus3Str}T09:55:00.000Z`,
      updatedAt: `${dMinus3Str}T18:40:00.000Z`,
    },
  ];

  const leaves: LeaveRequest[] = [
    {
      id: "lev_1",
      employeeId: "emp_5",
      employeeName: "Sneha Patel",
      department: "Social Media & PR",
      leaveType: "Casual Leave",
      fromDate: todayStr,
      toDate: todayStr,
      days: 1,
      reason: "Attending sister's engagement ceremony",
      status: "Approved",
      appliedDate: dMinus2Str,
      reviewedAt: `${dMinus1Str}T14:30:00.000Z`,
      reviewNote: "Approved by HR. Have a great time!",
      createdAt: `${dMinus2Str}T10:00:00.000Z`,
    },
    {
      id: "lev_2",
      employeeId: "emp_1",
      employeeName: "Priya Sharma",
      department: "SEO & Organic Growth",
      leaveType: "Paid Time Off",
      fromDate: "2026-09-15",
      toDate: "2026-09-18",
      days: 4,
      reason: "Annual family vacation travel",
      status: "Pending",
      appliedDate: dMinus1Str,
      createdAt: `${dMinus1Str}T16:20:00.000Z`,
    },
    {
      id: "lev_3",
      employeeId: "emp_2",
      employeeName: "Rahul Verma",
      department: "Paid Advertising",
      leaveType: "Sick Leave",
      fromDate: dMinus3Str,
      toDate: dMinus3Str,
      days: 1,
      reason: "Severe migraine and fever",
      status: "Approved",
      appliedDate: dMinus3Str,
      reviewedAt: `${dMinus3Str}T11:00:00.000Z`,
      reviewNote: "Approved. Take care.",
      createdAt: `${dMinus3Str}T08:30:00.000Z`,
    },
    {
      id: "lev_4",
      employeeId: "emp_4",
      employeeName: "Vikram Raman",
      department: "Web & Tech Engineering",
      leaveType: "Half Day Leave",
      fromDate: "2026-09-22",
      toDate: "2026-09-22",
      days: 0.5,
      reason: "Bank documentation and passport renewal",
      status: "Pending",
      appliedDate: todayStr,
      createdAt: `${todayStr}T10:15:00.000Z`,
    },
    {
      id: "lev_5",
      employeeId: "emp_3",
      employeeName: "Ananya Nair",
      department: "Creative Studio",
      leaveType: "Casual Leave",
      fromDate: "2026-08-10",
      toDate: "2026-08-12",
      days: 3,
      reason: "Extended weekend trip",
      status: "Rejected",
      appliedDate: "2026-08-01",
      reviewedAt: "2026-08-02T10:00:00.000Z",
      reviewNote: "Major brand pitch deliverable during this period. Please reschedule.",
      createdAt: "2026-08-01T15:00:00.000Z",
    },
  ];

  const loginLogs: LoginLog[] = [
    {
      id: "log_1",
      employeeId: "emp_1",
      employeeName: "Priya Sharma",
      email: "priya@bytechnologies.com",
      loginTime: `${todayStr}T09:12:35.000Z`,
      ipAddress: "192.168.1.42",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
    },
    {
      id: "log_2",
      employeeId: "emp_2",
      employeeName: "Rahul Verma",
      email: "rahul@bytechnologies.com",
      loginTime: `${todayStr}T10:05:12.000Z`,
      ipAddress: "192.168.1.68",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/127.0",
    },
    {
      id: "log_3",
      employeeId: "emp_4",
      employeeName: "Vikram Raman",
      email: "vikram@bytechnologies.com",
      loginTime: `${todayStr}T09:05:54.000Z`,
      ipAddress: "49.37.12.189",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/129.0",
    },
    {
      id: "log_4",
      employeeId: "emp_6",
      employeeName: "Karthik Sundaram",
      email: "karthik@bytechnologies.com",
      loginTime: `${todayStr}T09:10:02.000Z`,
      ipAddress: "192.168.1.15",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/17.5",
    },
    {
      id: "log_5",
      employeeId: "emp_1",
      employeeName: "Priya Sharma",
      email: "priya@bytechnologies.com",
      loginTime: `${dMinus1Str}T09:15:10.000Z`,
      ipAddress: "192.168.1.42",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
    },
  ];

  const jobs: JobOpening[] = [
    {
      id: "job_1",
      title: "Senior Performance Marketing Strategist",
      department: "Paid Advertising",
      openingsCount: 2,
      status: "open",
      postedDate: "2026-08-20",
      experience: "3-5 years",
      jobType: "Full-time",
      description: "Manage scale Meta and Google Ads campaigns with >$100k/mo spend. Drive ROAS, deep CRO analysis, and attribution modeling for global e-commerce and SaaS brands.",
      requirements: [
        "Proven track record scaling Meta/Google Ad accounts",
        "Expertise in Google Analytics 4, Tag Manager, and looker studio",
        "Strong analytical mindset and client presentation skills",
      ],
      createdAt: "2026-08-20T10:00:00.000Z",
      updatedAt: "2026-08-20T10:00:00.000Z",
    },
    {
      id: "job_2",
      title: "Technical SEO & Content Lead",
      department: "SEO & Organic Growth",
      openingsCount: 1,
      status: "open",
      postedDate: "2026-08-25",
      experience: "4+ years",
      jobType: "Hybrid",
      description: "Oversee enterprise SEO audits, site migrations, Core Web Vitals optimization, programmatic SEO strategies, and content clustering for client websites.",
      requirements: [
        "Deep technical SEO knowledge (Screaming Frog, Ahrefs, SEMrush)",
        "Core Web Vitals and JavaScript rendering expertise",
        "Experience leading cross-functional content and dev workflows",
      ],
      createdAt: "2026-08-25T11:30:00.000Z",
      updatedAt: "2026-08-25T11:30:00.000Z",
    },
    {
      id: "job_3",
      title: "Senior UI/UX & Motion Designer",
      department: "Creative Studio",
      openingsCount: 1,
      status: "open",
      postedDate: "2026-09-01",
      experience: "3+ years",
      jobType: "Full-time",
      description: "Craft high-converting ad creatives, interactive landing page prototypes, and complete brand identity packages for top-tier digital campaigns.",
      requirements: [
        "Proficiency in Figma, Adobe After Effects, and Illustrator",
        "Solid portfolio showcasing performance ad creatives and landing pages",
        "Understanding of conversion rate optimization (CRO) principles",
      ],
      createdAt: "2026-09-01T09:00:00.000Z",
      updatedAt: "2026-09-01T09:00:00.000Z",
    },
    {
      id: "job_4",
      title: "Junior Social Media Specialist",
      department: "Social Media & PR",
      openingsCount: 1,
      status: "closed",
      postedDate: "2026-07-10",
      experience: "1-2 years",
      jobType: "Full-time",
      description: "Manage editorial calendars, community engagement, and influencer collaborations across Instagram, LinkedIn, and TikTok.",
      requirements: [
        "Strong short-form video editing and copywriting chops",
        "Familiarity with Sprout Social or Buffer",
        "Creative curiosity and pop-culture awareness",
      ],
      createdAt: "2026-07-10T14:00:00.000Z",
      updatedAt: "2026-08-15T10:00:00.000Z",
    },
  ];

  return {
    admin: {
      name: "admin",
      password: "admin123",
    },
    employees,
    attendance,
    leaves,
    loginLogs,
    jobs,
    chatMessages: getDefaultMessages(),
    chatChannels: getDefaultChannels(),
  };
}

let inMemoryDb: DatabaseSchema | null = null;

export function readDatabase(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }
  try {
    const filePath = getDbPath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      inMemoryDb = JSON.parse(content);
      return inMemoryDb!;
    }

    // Fallback: If on Vercel and tmp isn't created yet, check bundled data file
    if (fs.existsSync(DEFAULT_DB_PATH)) {
      const content = fs.readFileSync(DEFAULT_DB_PATH, "utf-8");
      inMemoryDb = JSON.parse(content);
      try {
        fs.writeFileSync(filePath, content, "utf-8");
      } catch (e) {
        // ignore
      }
      return inMemoryDb!;
    }

    const seed = generateSeedData();
    inMemoryDb = seed;
    try {
      fs.writeFileSync(filePath, JSON.stringify(seed, null, 2), "utf-8");
    } catch (e) {
      // ignore
    }
    return seed;
  } catch (error) {
    console.error("Error reading database:", error);
    if (inMemoryDb) return inMemoryDb;
    const seed = generateSeedData();
    inMemoryDb = seed;
    return seed;
  }
}

export function writeDatabase(data: DatabaseSchema): void {
  inMemoryDb = data;
  try {
    const filePath = getDbPath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    // If writing to default path fails (e.g. read-only filesystem on Vercel), save to /tmp
    try {
      const fallbackPath = path.join(os.tmpdir(), "by_technologies_database.json");
      fs.writeFileSync(fallbackPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err2) {
      console.error("Error writing database:", error, err2);
    }
  }
}

// Entity helpers

export function getEmployees(): Employee[] {
  const db = readDatabase();
  return db.employees;
}

export function getEmployeeById(id: string): Employee | undefined {
  const db = readDatabase();
  return db.employees.find((e) => e.id === id || e.empId === id);
}

export function getEmployeeByEmail(email: string): Employee | undefined {
  if (!email) return undefined;
  const db = readDatabase();
  return db.employees.find((e) => e.email && e.email.toLowerCase() === email.toLowerCase());
}

export function getEmployeeByIdentifier(identifier: string): Employee | undefined {
  if (!identifier) return undefined;
  const db = readDatabase();
  const q = identifier.trim().toLowerCase();
  return db.employees.find(
    (e) =>
      e.empId.toLowerCase() === q ||
      e.id.toLowerCase() === q ||
      e.name.toLowerCase() === q ||
      (e.email && e.email.toLowerCase() === q)
  );
}

export function saveEmployee(employee: Employee): Employee {
  const db = readDatabase();
  const index = db.employees.findIndex((e) => e.id === employee.id);
  if (index >= 0) {
    db.employees[index] = { ...employee, updatedAt: new Date().toISOString() };
  } else {
    db.employees.push({
      ...employee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  writeDatabase(db);
  return employee;
}

export function deleteEmployee(id: string): boolean {
  const db = readDatabase();
  const initialLen = db.employees.length;
  db.employees = db.employees.filter((e) => e.id !== id && e.empId !== id);
  if (db.employees.length !== initialLen) {
    // Also clean up related records or keep logs
    writeDatabase(db);
    return true;
  }
  return false;
}

export function getNextEmpId(): string {
  const db = readDatabase();
  const maxNum = db.employees.reduce((max, emp) => {
    const match = emp.empId.match(/BYT-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 100);
  return `BYT-${maxNum + 1}`;
}

export function getAttendance(filters?: {
  date?: string;
  month?: string;
  employeeId?: string;
}): Attendance[] {
  const db = readDatabase();
  let list = db.attendance;
  if (filters?.date) {
    list = list.filter((a) => a.date === filters.date);
  }
  if (filters?.month) {
    const m = filters.month;
    list = list.filter((a) => a.date.startsWith(m));
  }
  if (filters?.employeeId) {
    const empId = filters.employeeId;
    list = list.filter((a) => a.employeeId === empId);
  }
  return list.sort((a, b) => b.date.localeCompare(a.date));
}

export function saveAttendance(record: Attendance): Attendance {
  const db = readDatabase();
  const index = db.attendance.findIndex(
    (a) => a.employeeId === record.employeeId && a.date === record.date
  );
  if (index >= 0) {
    db.attendance[index] = {
      ...db.attendance[index],
      ...record,
      updatedAt: new Date().toISOString(),
    };
  } else {
    db.attendance.push({
      ...record,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  writeDatabase(db);
  return record;
}

export function getLeaves(employeeId?: string): LeaveRequest[] {
  const db = readDatabase();
  let list = db.leaves;
  if (employeeId) {
    list = list.filter((l) => l.employeeId === employeeId);
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveLeave(leave: LeaveRequest): LeaveRequest {
  const db = readDatabase();
  const index = db.leaves.findIndex((l) => l.id === leave.id);
  if (index >= 0) {
    db.leaves[index] = leave;
  } else {
    db.leaves.unshift(leave);
  }
  writeDatabase(db);
  return leave;
}

export function addLoginLog(log: Omit<LoginLog, "id">): LoginLog {
  const db = readDatabase();
  const newLog: LoginLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };
  db.loginLogs.unshift(newLog);
  // Keep last 500 logs
  if (db.loginLogs.length > 500) {
    db.loginLogs = db.loginLogs.slice(0, 500);
  }
  writeDatabase(db);
  return newLog;
}

export function getLoginLogs(limit = 100): LoginLog[] {
  const db = readDatabase();
  return db.loginLogs.slice(0, limit);
}

export function getJobs(): JobOpening[] {
  const db = readDatabase();
  return db.jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveJob(job: JobOpening): JobOpening {
  const db = readDatabase();
  const index = db.jobs.findIndex((j) => j.id === job.id);
  if (index >= 0) {
    db.jobs[index] = { ...job, updatedAt: new Date().toISOString() };
  } else {
    db.jobs.unshift({
      ...job,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  writeDatabase(db);
  return job;
}

export function deleteJob(id: string): boolean {
  const db = readDatabase();
  const initialLen = db.jobs.length;
  db.jobs = db.jobs.filter((j) => j.id !== id);
  if (db.jobs.length !== initialLen) {
    writeDatabase(db);
    return true;
  }
  return false;
}

// ==========================================
// CHAT & TEAM CONNECT
// ==========================================

export function getChatChannels(): ChatChannel[] {
  const db = readDatabase();
  return db.chatChannels || getDefaultChannels();
}

export function saveChatChannel(channel: ChatChannel): ChatChannel {
  const db = readDatabase();
  if (!db.chatChannels) db.chatChannels = getDefaultChannels();
  const idx = db.chatChannels.findIndex((c) => c.id === channel.id);
  if (idx >= 0) {
    db.chatChannels[idx] = channel;
  } else {
    db.chatChannels.push(channel);
  }
  writeDatabase(db);
  return channel;
}

export function getChatMessages(filter?: {
  channelId?: string;
  dmUser1?: string;
  dmUser2?: string;
}): ChatMessage[] {
  const db = readDatabase();
  const allMessages = db.chatMessages || getDefaultMessages();

  if (filter?.channelId) {
    return allMessages
      .filter((m) => m.channelId === filter.channelId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  if (filter?.dmUser1 && filter?.dmUser2) {
    const u1 = filter.dmUser1;
    const u2 = filter.dmUser2;
    return allMessages
      .filter(
        (m) =>
          !m.channelId &&
          ((m.senderId === u1 && m.recipientId === u2) ||
            (m.senderId === u2 && m.recipientId === u1))
      )
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  return allMessages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function saveChatMessage(
  msg: Omit<ChatMessage, "id" | "timestamp" | "readBy"> & {
    id?: string;
    timestamp?: string;
    readBy?: string[];
  }
): ChatMessage {
  const db = readDatabase();
  if (!db.chatMessages) db.chatMessages = getDefaultMessages();

  const newMsg: ChatMessage = {
    ...msg,
    id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: msg.timestamp || new Date().toISOString(),
    readBy: msg.readBy || [msg.senderId],
  };

  db.chatMessages.push(newMsg);
  // Keep last 2000 messages
  if (db.chatMessages.length > 2000) {
    db.chatMessages = db.chatMessages.slice(db.chatMessages.length - 2000);
  }
  writeDatabase(db);
  return newMsg;
}

export function markMessagesAsRead(
  userId: string,
  target: { channelId?: string; dmSenderId?: string }
): boolean {
  const db = readDatabase();
  if (!db.chatMessages) return false;

  let modified = false;
  db.chatMessages.forEach((m) => {
    if (target.channelId && m.channelId === target.channelId) {
      if (!m.readBy.includes(userId)) {
        m.readBy.push(userId);
        modified = true;
      }
    } else if (
      target.dmSenderId &&
      !m.channelId &&
      m.senderId === target.dmSenderId &&
      m.recipientId === userId
    ) {
      if (!m.readBy.includes(userId)) {
        m.readBy.push(userId);
        modified = true;
      }
    }
  });

  if (modified) {
    writeDatabase(db);
  }
  return modified;
}

export function getUnreadChatCount(userId: string): {
  total: number;
  channels: Record<string, number>;
  dms: Record<string, number>;
} {
  const db = readDatabase();
  const allMessages = db.chatMessages || [];

  const channels: Record<string, number> = {};
  const dms: Record<string, number> = {};
  let total = 0;

  allMessages.forEach((m) => {
    if (m.senderId === userId) return;

    const isUnread = !m.readBy.includes(userId);
    if (!isUnread) return;

    if (m.channelId) {
      channels[m.channelId] = (channels[m.channelId] || 0) + 1;
      total++;
    } else if (m.recipientId === userId) {
      dms[m.senderId] = (dms[m.senderId] || 0) + 1;
      total++;
    }
  });

  return { total, channels, dms };
}

