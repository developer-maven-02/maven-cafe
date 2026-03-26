// import { NextResponse } from "next/server";
// import { supabaseServer } from "@/lib/supabase-server";

// export async function GET() {
//   try {
//     const { data: liveOrders } = await supabaseServer
//       .from("orders")
//       .select("*")
//       .in("status", ["Pending", "Accepted", "Preparing"]);

//     const { data: liveServices } = await supabaseServer
//       .from("customer_service_requests")
//       .select("*")
//       .in("status", ["Pending", "Processing"]);

//     const { count: completedCount } = await supabaseServer
//       .from("orders")
//       .select("*", { count: "exact", head: true })
//       .eq("status", "Served");

//     const { count: rejectedCount } = await supabaseServer
//       .from("orders")
//       .select("*", { count: "exact", head: true })
//       .eq("status", "Rejected");

//     const { count: totalServiceCount } = await supabaseServer
//       .from("customer_service_requests")
//       .select("*", { count: "exact", head: true });

//     const { count: cancelledServiceCount } = await supabaseServer
//       .from("customer_service_requests")
//       .select("*", { count: "exact", head: true })
//       .eq("status", "Rejected");

//     return NextResponse.json({
//       success: true,
//       liveOrders,
//       liveServices,
//       completedCount,
//       rejectedCount,
//       totalServiceCount,
//       cancelledServiceCount,
//     });

//   } catch (error) {
//     return NextResponse.json({
//       success: false,
//       message: "Server error",
//     });
//   }
// }

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const formattedDate = thirtyDaysAgo.toISOString();

const { data: liveOrders } = await supabaseServer
  .from("orders")
  .select("*")
  .not("status", "in", '("Served","Rejected")')
  .gte("created_at", formattedDate);
  
    const { data: liveServices } = await supabaseServer
      .from("customer_service_requests")
      .select("*")
      .in("status", ["Pending", "Processing"])
      .gte("created_at", formattedDate);

    const { count: completedCount } = await supabaseServer
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "Served")
      .gte("created_at", formattedDate);

    const { count: rejectedCount } = await supabaseServer
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "Rejected")
      .gte("created_at", formattedDate);

    const { count: totalServiceCount } = await supabaseServer
      .from("customer_service_requests")
      .select("*", { count: "exact", head: true })
      .gte("created_at", formattedDate);

    const { count: cancelledServiceCount } = await supabaseServer
      .from("customer_service_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "Rejected")
      .gte("created_at", formattedDate);

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