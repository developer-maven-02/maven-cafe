import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { userId } = await verifyToken(req);

    const { data, error } = await supabaseServer
      .from("customer_service_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      requests: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}