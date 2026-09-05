import { NextRequest, NextResponse } from "next/server";
import {
  getEmployeeById,
  saveEmployee,
  deleteEmployee,
  getEmployeeByEmail,
} from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const employee = getEmployeeById(id);
    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, employee });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to get employee" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = getEmployeeById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      designation,
      department,
      dateOfJoining,
      status,
      password,
      avatarUrl,
    } = body;

    if (email && existing.email && email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailTaken = getEmployeeByEmail(email);
      if (emailTaken && emailTaken.id !== existing.id) {
        return NextResponse.json(
          { success: false, error: "Email already taken by another employee" },
          { status: 409 }
        );
      }
    }

    const updated = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      email: email !== undefined ? (email ? email.trim().toLowerCase() : "") : existing.email,
      phone: phone !== undefined ? phone.trim() : existing.phone,
      designation: designation !== undefined ? designation.trim() : existing.designation,
      department: department !== undefined ? department.trim() : existing.department,
      dateOfJoining: dateOfJoining !== undefined ? dateOfJoining : existing.dateOfJoining,
      status: status !== undefined ? status : existing.status,
      password: password !== undefined && password !== "" ? password : existing.password,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
    };

    saveEmployee(updated);

    return NextResponse.json({ success: true, employee: updated });
  } catch (error) {
    console.error("PUT employee error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const success = deleteEmployee(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Employee not found or could not be deleted" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
