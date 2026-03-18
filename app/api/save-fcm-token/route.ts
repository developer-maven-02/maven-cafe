import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { fcmToken } = await req.json(); // token from client
    if (!fcmToken) return NextResponse.json({ success: false, message: "No token provided" }, { status: 400 });

    // Verify JWT cookie
    const { userId, role } = await verifyToken(req);

    if (role !== "staff") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // Save token directly in users table
    const { error } = await supabase
      .from("users")
      .update({ fcm_token: fcmToken })
      .eq("id", userId);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}