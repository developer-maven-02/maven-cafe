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
      .from("customer_service_requests")
      .select("*")
      .order("created_at", { ascending: false });

    // Status filter
    if (status && status !== "All") {
      query = query.eq("status", status);
    }

    // Search filter
    if (search) {
      query = query.ilike("user_name", `%${search}%`);
    }

    // Start date filter
    if (startDate) {
      query = query.gte("created_at", `${startDate} 00:00:00`);
    }

    // End date filter
    if (endDate) {
      query = query.lte("created_at", `${endDate} 23:59:59`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        requests: data || []
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Service Requests API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error"
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
try {
const body = await req.json();
const { name, icon } = body;

if (!name) {
return NextResponse.json({ success: false, message: "Service name is required" });
}

const { data, error } = await supabaseServer
.from("special_services")
.insert({ name, icon })
.select()
.single();

if (error) {
return NextResponse.json({ success: false, message: error.message });
}

return NextResponse.json({ success: true, message: "Service created", data });
} catch (err) {
return NextResponse.json({ success: false, message: "Server error" });
}
}