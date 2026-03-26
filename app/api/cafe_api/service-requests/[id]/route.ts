import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseServer
      .from("customer_service_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      request: data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const body = await req.json();


    

       const updatePayload: any = {
      status: body.status,
      rejected_reason: body.rejected_reason || null,
      updated_at: new Date().toISOString(),
    };

    // Set start_time when status is "Processing"
    if (body.status === "Processing") {
      updatePayload.start_time = body.start_time;
    }

    // Set end_time when status is "Completed"
    if (body.status === "Completed") {
      updatePayload.end_time = body.end_time;
    }

    const { data, error } = await supabaseServer
      .from("customer_service_requests")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      request: data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}