import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {

    const { data, error } = await supabaseServer
      .from("items")
      .select("*")
      .eq("is_available", true)
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
        message: "Items fetched successfully",
        items: data,
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