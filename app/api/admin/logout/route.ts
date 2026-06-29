import { NextResponse } from "next/server";
import { backendAdminLogoutJson, clearStoredAdminSession } from "@/lib/adminBackend";

export async function POST() {
  try {
    await backendAdminLogoutJson();
  } finally {
    await clearStoredAdminSession();
  }
  return NextResponse.json({ success: true });
}
