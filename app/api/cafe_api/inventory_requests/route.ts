import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Verify logged-in user
    const { userId } = await verifyToken(req);

    // Get request body
    const { product_name, quantity, unit, reason, type, item_status} = await req.json();

    if (!product_name || !quantity) {
      return NextResponse.json(
        { success: false, message: "Product name and quantity are required" },
        { status: 400 }
      );
    }

    // Fetch user info
    const { data: user } = await supabaseServer
      .from("users")
      .select("name")
      .eq("id", userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Insert inventory request
    const { data: request, error: insertError } = await supabaseServer
      .from("inventory_requests")
      .insert([
        {
          user_id: userId,
          user_name: user.name,
          product_name,
          quantity: Number(quantity),
          unit: unit || "",
          reason: reason || "",
          type,
          item_status,
          status: "Pending",
        },
      ])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, request },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Verify logged-in user
    const { userId } = await verifyToken(req);

    const { data, error } = await supabaseServer
      .from("inventory_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data || [] },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}