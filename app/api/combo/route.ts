import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { userId } = await verifyToken(req);

    const body = await req.json();

    const { name, item_ids, total_price } = body;

    const { data, error } = await supabaseServer
      .from("combos")
      .insert([
        {
          user_id: userId,
          name,
          item_ids,
          total_price,
        },
      ])
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
      combo: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}


export async function GET(req: Request) {
  try {
    const { userId } = await verifyToken(req);

    const { data, error } = await supabaseServer
      .from("combos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      combos: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}