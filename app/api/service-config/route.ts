import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data: services, error: serviceError } = await supabaseServer
      .from("special_services")
      .select("*")
      .eq("is_available", true)
      .order("created_at");

    const { data: notes, error: noteError } = await supabaseServer
      .from("quick_notes")
      .select("*")
      .order("created_at");

    if (serviceError || noteError) {
      return NextResponse.json({
        success: false,
        message: serviceError?.message || noteError?.message,
      });
    }

    return NextResponse.json({
      success: true,
      services,
      notes,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}