import { NextResponse } from "next/server";
import { backendAdminLoginJson, setStoredAdminSession } from "@/lib/adminBackend";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username dan password wajib diisi." }, { status: 400 });
    }

    const result = await backendAdminLoginJson(username, password);
    if (!result.ok || !result.sessionValue) {
      return NextResponse.json({ success: false, message: result.message || "Username atau password admin tidak valid." }, { status: 401 });
    }

    await setStoredAdminSession(result.sessionValue);

    // Also forward the Flask session cookie to the browser so client-side
    // fetch requests through the /api/v1/* rewrite carry auth correctly.
    const response = NextResponse.json({ success: true });
    response.cookies.set("session", result.sessionValue.replace("session=", ""), {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Internal error" }, { status: 500 });
  }
}
