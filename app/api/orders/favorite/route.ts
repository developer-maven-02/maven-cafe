import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { userId } = await verifyToken(req);

    const { order_id, is_favorite } = await req.json();

    // Verify order belongs to user
    const { data: order } = await supabaseServer
      .from("orders")
      .select("id")
      .eq("id", order_id)
      .eq("user_id", userId)
      .single();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Update favorite
    const { data, error } = await supabaseServer
      .from("orders")
      .update({
        is_favorite,
      })
      .eq("id", order_id)
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

    return NextResponse.json({
      success: true,
      message: is_favorite
        ? "Added to favorite"
        : "Removed from favorite",
      order: data,
    });
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

export async function GET(req: Request) {
  try {
    const { userId } = await verifyToken(req);

    const { data, error } = await supabaseServer
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .eq("is_favorite", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      orders: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}