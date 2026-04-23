import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ FIXED
) {
  try {
    const { userId } = await verifyToken(req);

    // ✅ MUST await params
    const { id } = await params;

    const body = await req.json();
    const { current_stock, item_status } = body;
    console.log('check',body);
    // ✅ Validation
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    if (current_stock === undefined || current_stock < 0) {
      return NextResponse.json(
        { success: false, error: "Invalid current_stock" },
        { status: 400 }
      );
    }

    // ✅ Update inventory
    const { data, error } = await supabaseServer
      .from("inventory_requests")
      .update({
        current_stock,
        item_status,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Stock updated successfully",
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}