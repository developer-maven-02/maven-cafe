import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Order id required",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("GET ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Order id required",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body.status) {
      return NextResponse.json(
        {
          success: false,
          message: "Status required",
        },
        { status: 400 }
      );
    }

    const updateData: any = {
  status: body.status,
  rejected_reason: body.reject_reason || null,
  updated_at: new Date().toISOString(),
};

console.log('body.start_time',body.start_time);

if (body.status === "Accepted") {
  updateData.start_time = body.start_time;
}

if (body.status === "Served") {
  updateData.end_time = body.end_time;
}

    const { data, error } = await supabaseServer
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("PATCH ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}