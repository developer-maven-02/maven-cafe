import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// ✅ GET single note
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ unwrap the promise
    const { data, error } = await supabaseServer
      .from("quick_notes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return NextResponse.json({ success: false, message: error.message });

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" });
  }
}

// ✅ UPDATE note
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, message: "Note text is required" });
    }

    const { data, error } = await supabaseServer
      .from("quick_notes")
      .update({ text, updated_at: new Date() })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, message: error.message });

    return NextResponse.json({ success: true, message: "Note updated", data });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" });
  }
}

// ✅ DELETE note
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { error } = await supabaseServer
      .from("quick_notes")
      .delete()
      .eq("id", id);

    if (error) return NextResponse.json({ success: false, message: error.message });

    return NextResponse.json({ success: true, message: "Note deleted" });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" });
  }
}