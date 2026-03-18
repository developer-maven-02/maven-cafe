import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await verifyToken(req);

    const body = await req.json();
    const { id, rating, review, type } = body;

    if (!id || !rating || !type) {
      return NextResponse.json({
        success: false,
        message: "Required fields missing",
      });
    }

    const table =
      type === "service"
        ? "customer_service_requests"
        : "orders";

    const { data, error } = await supabaseServer
      .from(table)
      .update({
        rating,
        review,
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
      data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}