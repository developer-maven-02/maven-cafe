import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("orders")
      .select("user_name");

    if (error) throw error;

    const users = [...new Set(data.map((i) => i.user_name))];

    return NextResponse.json({ success: true, users });
  } catch {
    return NextResponse.json({ success: false });
  }
}