import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    // ✅ delete auth user first
    const { error } = await supabaseServer.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: "Member deleted successfully"
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    });
  }
}