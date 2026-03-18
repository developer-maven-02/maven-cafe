import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data: liveOrders } = await supabaseServer
      .from("orders")
      .select("*")
      .in("status", ["Pending", "Accepted", "Preparing"]);

    const { data: liveServices } = await supabaseServer
      .from("customer_service_requests")
      .select("*")
      .in("status", ["Pending", "Processing"]);

    const { count: completedCount } = await supabaseServer
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "Served");

    const { count: rejectedCount } = await supabaseServer
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "Rejected");

    const { count: totalServiceCount } = await supabaseServer
      .from("customer_service_requests")
      .select("*", { count: "exact", head: true });

    const { count: cancelledServiceCount } = await supabaseServer
      .from("customer_service_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "Rejected");

    return NextResponse.json({
      success: true,
      liveOrders,
      liveServices,
      completedCount,
      rejectedCount,
      totalServiceCount,
      cancelledServiceCount,
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}