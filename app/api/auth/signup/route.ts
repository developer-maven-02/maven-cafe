import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password, name, role } = body;

    const { data, error } = await supabaseServer.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    if (data.user) {
      const { error: insertError } = await supabaseServer.from("users").insert([
        {
          id: data.user.id,
          name,
          email,
          role,
          status: "active",
        },
      ]);

      if (insertError) {
        return NextResponse.json(
          { success: false, message: insertError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}