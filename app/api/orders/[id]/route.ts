import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await verifyToken(req);
    const { id } = await params;

    const { data, error } = await supabaseServer
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
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
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}