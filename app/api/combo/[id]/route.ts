import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseServer
      .from("combos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message,
      });
    }

    const { data: menuItems, error: menuError } =
      await supabaseServer
        .from("items")
        .select("*")
        .in("id", data.item_ids);

    if (menuError) {
      return NextResponse.json({
        success: false,
        message: menuError.message,
      });
    }

    return NextResponse.json({
      success: true,
      combo: {
        ...data,
        items: menuItems,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}