import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// ✅ GET all notes
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("quick_notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ success: false, message: error.message });

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" });
  }
}

// ✅ CREATE new note
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, message: "Note text is required" });
    }

    const { data, error } = await supabaseServer
      .from("quick_notes")
      .insert({ text })
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, message: error.message });

    return NextResponse.json({ success: true, message: "Note created", data });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" });
  }
}