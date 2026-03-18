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

    const { data, error } = await supabaseServer
      .from("customer_service_requests")
      .update({
        status: body.status,
        rejected_reason: body.rejected_reason || null,
        updated_at: new Date().toISOString(),
      })
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