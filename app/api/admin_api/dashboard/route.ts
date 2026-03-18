import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json({
        success: false,
        message: "Start date and end date required"
      });
    }

    const start = `${startDate} 00:00:00`;
    const end = `${endDate} 23:59:59`;

    // Total Orders
    const { count: totalOrders } = await supabaseServer
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", start)
      .lte("created_at", end);

    // Completed Orders
    const { count: completedOrders } = await supabaseServer
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "Served")
      .gte("created_at", start)
      .lte("created_at", end);

    // Total Requests
    const { count: totalRequests } = await supabaseServer
      .from("customer_service_requests")
      .select("*", { count: "exact", head: true })
      .gte("created_at", start)
      .lte("created_at", end);

    // Completed Requests
    const { count: completedRequests } = await supabaseServer
      .from("customer_service_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "Completed")
      .gte("created_at", start)
      .lte("created_at", end);

    return NextResponse.json({
      success: true,
      data: {
        totalOrders: totalOrders || 0,
        completedOrders: completedOrders || 0,
        totalRequests: totalRequests || 0,
        completedRequests: completedRequests || 0
      }
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}