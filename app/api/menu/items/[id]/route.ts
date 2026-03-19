import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  
    const { userId } = await verifyToken(req);

    const { id } = await params;

    const { data, error } = await supabaseServer
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

          // user seat fetch
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("seat")
      .eq("id", userId)
      .single();


    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      seat: user?.seat || "",
      item: data,
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