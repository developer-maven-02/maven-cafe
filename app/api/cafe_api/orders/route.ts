import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      orders: data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}