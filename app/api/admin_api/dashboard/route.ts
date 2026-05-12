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

       const { count: totalCategoryAUsers } = await supabaseServer
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("team_type", "Team A");

    // Category B Users
    const { count: totalCategoryBUsers } = await supabaseServer
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("team_type", "Team B");

    // Active Users
    const { count: activeUsers } = await supabaseServer
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Inactive Users
    const { count: inactiveUsers } = await supabaseServer
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("status", "inactive");

      const { count: totalCategoryAMenus } = await supabaseServer
  .from("items")
  .select("*", { count: "exact", head: true })
  .eq("is_available", true)
  

// Category B Menu Items
const { count: totalCategoryBMenus } = await supabaseServer
  .from("items")
  .select("*", { count: "exact", head: true })
  .eq("is_available", true)
  .eq("item_type", true);

    return NextResponse.json({
      success: true,
      data: {
        totalOrders: totalOrders || 0,
        completedOrders: completedOrders || 0,
        totalRequests: totalRequests || 0,
        completedRequests: completedRequests || 0,
        totalCategoryAUsers: totalCategoryAUsers || 0,
        totalCategoryBUsers: totalCategoryBUsers || 0,
        activeUsers: activeUsers || 0,
        inactiveUsers: inactiveUsers || 0,
        totalCategoryBMenus: totalCategoryBMenus || 0,
        totalCategoryAMenus: totalCategoryAMenus || 0,
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