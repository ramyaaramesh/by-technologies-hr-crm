import { NextRequest, NextResponse } from "next/server";
import {
  getEmployees,
  saveEmployee,
  getNextEmpId,
  getEmployeeByEmail,
} from "@/lib/db";
import { Employee } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const department = searchParams.get("department");
    const status = searchParams.get("status");

    let list = getEmployees();

    if (search) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(search) ||
          (e.email && e.email.toLowerCase().includes(search)) ||
          e.empId.toLowerCase().includes(search) ||
          e.designation.toLowerCase().includes(search)
      );
    }

    if (department && department !== "All") {
      list = list.filter((e) => e.department === department);
    }

    if (status && status !== "All") {
      list = list.filter((e) => e.status === status);
    }

    return NextResponse.json({ success: true, employees: list });
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      designation,
      department,
      dateOfJoining,
      status = "active",
      password = "password123",
      avatarUrl,
    } = body;

    if (!name || !designation || !department) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, designation, and department are required",
        },
        { status: 400 }
      );
    }

    if (email && email.trim() !== "") {
      const existing = getEmployeeByEmail(email);
      if (existing) {
        return NextResponse.json(
          { success: false, error: "An employee with this email already exists" },
          { status: 409 }
        );
      }
    }

    const empId = getNextEmpId();
    const newEmployee: Employee = {
      id: `emp_${Date.now()}`,
      empId,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : "",
      phone: phone?.trim() || "",
      designation: designation.trim(),
      department: department.trim(),
      dateOfJoining: dateOfJoining || new Date().toISOString().split("T")[0],
      status: status === "inactive" ? "inactive" : "active",
      password: password || "password123",
      avatarUrl:
        avatarUrl ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          name
        )}&backgroundColor=331e1e&textColor=a2fc4b`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveEmployee(newEmployee);

    return NextResponse.json({ success: true, employee: newEmployee }, { status: 201 });
  } catch (error) {
    console.error("POST /api/employees error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
