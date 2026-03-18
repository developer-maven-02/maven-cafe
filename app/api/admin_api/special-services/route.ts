import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// ✅ GET all services
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("special_services")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, message: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Server error" });
  }
}

// ✅ CREATE new service
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, icon } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: "Service name is required" });
    }

    const { data, error } = await supabaseServer
      .from("special_services")
      .insert({ name, icon })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message });
    }

    return NextResponse.json({ success: true, message: "Service created", data });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Server error" });
  }
}