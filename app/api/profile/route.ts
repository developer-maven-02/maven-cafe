import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { userId } = await verifyToken(req);

    const { data, error } = await supabaseServer
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      user: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await verifyToken(req);

    // ✅ Read form data (NOT JSON)
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const seat = formData.get("seat") as string;
    const file = formData.get("profile_image") as File | null;

    let imageUrl = null;

    // ✅ If image exists → upload to Supabase
    if (file && file.size > 0) {
      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabaseServer.storage
        .from("profile-images")
        .upload(fileName, file, {
          contentType: file.type,
        });

      if (uploadError) {
        return NextResponse.json({
          success: false,
          message: uploadError.message,
        });
      }

      // ✅ Get public URL
      const { data } = supabaseServer.storage
        .from("profile-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    // ✅ Update DB
    const { data, error } = await supabaseServer
      .from("users")
      .update({
        name,
        seat,
        ...(imageUrl && { profile_image: imageUrl }), // only if uploaded
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      user: data,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}