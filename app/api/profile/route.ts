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

    const body = await req.json();

    const { name, seat } = body;

    const { data, error } = await supabaseServer
      .from("users")
      .update({
        name,
        seat,
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