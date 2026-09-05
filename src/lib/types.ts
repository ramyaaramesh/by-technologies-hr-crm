export type UserRole = "admin" | "employee";

export * from "./designations";

export interface Employee {
  id: string;
  empId: string; // e.g. BYT-101 (Primary login identifier)
  name: string;
  email?: string; // Optional - no mail ID needed
  phone: string;
  designation: string;
  department: string;
  dateOfJoining: string; // YYYY-MM-DD
  status: "active" | "inactive";
  password: string; // portal password
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = "Present" | "Absent" | "Late" | "Half day" | "On Leave";
export type WorkType = "Office" | "Remote (WFH)" | "Client Site";

export interface Attendance {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  workType?: WorkType;
  checkInTime?: string; // e.g. "09:15 AM"
  checkOutTime?: string; // e.g. "06:30 PM"
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeaveType =
  | "Casual Leave"
  | "Sick Leave"
  | "Paid Time Off"
  | "Half Day Leave"
  | "Unpaid Leave";

export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  leaveType: LeaveType;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string; // YYYY-MM-DD
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
}

export interface LoginLog {
  id: string;
  employeeId: string;
  empId?: string; // e.g. BYT-101
  employeeName: string;
  email?: string;
  loginTime: string; // ISO string
  ipAddress: string;
  userAgent: string;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  openingsCount: number;
  status: "open" | "closed";
  postedDate: string; // YYYY-MM-DD
  experience: string;
  jobType: "Full-time" | "Hybrid" | "Remote" | "Internship";
  description: string;
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminCredentials {
  name: string;
  password: string;
}

export interface AuthSession {
  role: UserRole;
  employee?: Employee;
  adminName?: string;
  token?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'admin' or employee ID e.g. 'emp_1'
  senderName: string;
  senderEmpId?: string; // 'HR-ADMIN' or 'BYT-101'
  senderDesignation?: string;
  senderRole?: UserRole;
  recipientId?: string; // If set, this is a 1-on-1 Direct Message (DM)
  channelId?: string; // If set, this is a Group Channel message
  text: string;
  content?: string;
  timestamp: string; // ISO string
  createdAt?: string;
  readBy: string[]; // Array of user IDs who have read this message
}

export interface ChatChannel {
  id: string; // e.g. 'general', 'management'
  name: string; // e.g. '#general'
  description: string;
  isGroup: boolean;
  memberIds: string[]; // ['all'] or array of IDs
  createdAt: string;
}

