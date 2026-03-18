import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password } = body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 200 }
      );
    }

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    const token = jwt.sign(
      {
        userId: data.user.id,
        role: user?.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    const response = NextResponse.json({
      success: true,
      role: user?.role,
      user,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
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