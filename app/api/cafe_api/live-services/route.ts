import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await verifyToken(req);

    const { data, error } = await supabaseServer
      .from("customer_service_requests")
      .select("*")
      .in("status", ["Pending", "Accepted"])
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      services: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}