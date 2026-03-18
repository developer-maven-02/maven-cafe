import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      password,
      role,
      seat,
      profile_image,
      status
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: "Name, email and password required"
      });
    }

    const { data: authData, error: authError } =
      await supabaseServer.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

    if (authError) {
      return NextResponse.json({
        success: false,
        message: authError.message
      });
    }

    const userId = authData.user.id;

    const { error } = await supabaseServer
      .from("users")
      .insert([
        {
          id: userId,
          name,
          email,
          role,
          seat,
          profile_image,
          status
        }
      ]);

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message
      });
    }

    return NextResponse.json({
      success: true
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    });
  }
}