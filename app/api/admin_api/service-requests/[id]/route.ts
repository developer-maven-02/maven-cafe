import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// ✅ GET single service
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // unwrap promise

    const { data, error } = await supabaseServer
      .from("special_services")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}

// ✅ UPDATE service
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, icon, is_available } = body;

    if (!name || !icon) {
      return NextResponse.json({ success: false, message: "Name and icon are required" });
    }

    const { data, error } = await supabaseServer
      .from("special_services")
      .update({ name, icon, is_available, updated_at: new Date() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message });
    }

    return NextResponse.json({ success: true, message: "Service updated", data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}

// ✅ DELETE service
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { error } = await supabaseServer
      .from("special_services")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message });
    }

    return NextResponse.json({ success: true, message: "Service deleted" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}