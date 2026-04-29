import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const statusFilter = searchParams.get("status");
    const searchTerm = searchParams.get("search");
    const userFilter = searchParams.get("user"); // ✅ ADD THIS

    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let query = supabaseServer
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    // ✅ STATUS FILTER
    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    // ✅ USER FILTER (NEW)
    if (userFilter) {
      query = query.eq("user_name", userFilter);
    }

    // ✅ SEARCH FILTER
    if (searchTerm) {
      query = query.or(
        `item_name.ilike.%${searchTerm}%,user_name.ilike.%${searchTerm}%`
      );
    }

    // ✅ DATE RANGE FILTER
    if (startDate && endDate) {
      query = query
        .gte("created_at", startDate)
        .lte("created_at", endDate + "T23:59:59");
    } else if (startDate) {
      query = query.gte("created_at", startDate);
    } else if (endDate) {
      query = query.lte("created_at", endDate + "T23:59:59");
    }

    const { data, error } = await query;

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