import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { userId } = await verifyToken(req);

    const body = await req.json();
    const { reason, description, status } = body;

    if (!reason || !description) {
      return NextResponse.json({
        success: false,
        message: "Reason and description required",
      });
    }

    const { data: user } = await supabaseServer
      .from("users")
      .select("name")
      .eq("id", userId)
      .single();

    const { data, error } = await supabaseServer
      .from("complaints")
      .insert([
        {
          user_id: userId,
          user_name: user?.name || "",
          reason,
          description,
          status: status || "Pending",
        },
      ])
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
      complaint: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}