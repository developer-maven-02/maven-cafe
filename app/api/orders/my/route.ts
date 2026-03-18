import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { userId } = await verifyToken(req);

    const { data, error } = await supabaseServer
      .from("orders")
      .select(`
        id,
        item_name,
        quantity,
        status,
        created_at,
        rating,
        review
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Orders fetched successfully",
        orders: data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 }
    );
  }
}