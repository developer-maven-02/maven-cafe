import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = supabaseServer
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    // Status filter
    if (status && status !== "All") {
      query = query.eq("status", status);
    }

    // Search by user name
    if (search) {
      query = query.ilike("user_name", `%${search}%`);
    }

    // Date filter
    if (startDate) {
      query = query.gte("created_at", `${startDate} 00:00:00`);
    }

    if (endDate) {
      query = query.lte("created_at", `${endDate} 23:59:59`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message
      });
    }

    return NextResponse.json({
      success: true,
      orders: data
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}