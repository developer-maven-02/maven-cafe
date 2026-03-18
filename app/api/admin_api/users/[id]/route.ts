import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";


// ✅ GET single user
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabaseServer
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message
      });
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch {
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}


// ✅ UPDATE user
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const {
      name,
      email,
      role,
      seat,
      status,
      password,
      profile_image
    } = body;

    const updateData: any = {
      name,
      email,
      role,
      seat,
      status,
      profile_image,
      updated_at: new Date()
    };

    // ✅ update profile table
    const { data, error } = await supabaseServer
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message
      });
    }

    // ✅ update auth password
    if (password && password.trim() !== "") {
      const { error: authError } =
        await supabaseServer.auth.admin.updateUserById(id, {
          password
        });

      if (authError) {
        return NextResponse.json({
          success: false,
          message: authError.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Member updated successfully",
      data
    });

  } catch {
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}