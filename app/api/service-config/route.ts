import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {


    const { userId } = await verifyToken(req);

    // Fetch user seat
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("seat")
      .eq("id", userId)
      .single();

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
        message:           userError?.message ||
serviceError?.message || noteError?.message,
      });
    }

    return NextResponse.json({
      success: true,
      seat: user?.seat || null,

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