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
      .from("inventory_requests")
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
    console.error("Inventory Requests API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error"
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Request ID is required" },
        { status: 400 }
      );
    }

    const updatePayload: any = {
      status,
      approved_at: new Date().toISOString(),
    };

    if (notes) {
      updatePayload.admin_remark = notes;
    }

    const { data, error } = await supabaseServer
      .from("inventory_requests")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, request: data },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
