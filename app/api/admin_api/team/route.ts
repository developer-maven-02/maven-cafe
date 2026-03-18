import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let query = supabaseServer
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,role.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message
      });
    }

    return NextResponse.json({
      success: true,
      members: data
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    });
  }
}