import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";
import admin from "firebase-admin";

// Initialize Firebase Admin once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(req: Request) {
  try {
    // Verify user
    const { userId } = await verifyToken(req);

    // Get order body
    const {
      item_id,
      quantity,
      temperature,
      drink_type,
      sugar,
      food_type,
      notes,
    } = await req.json();

    // Fetch user
    const { data: user } = await supabaseServer
      .from("users")
      .select("name, seat")
      .eq("id", userId)
      .single();

    // Fetch item
    const { data: item } = await supabaseServer
      .from("items")
      .select("*")
      .eq("id", item_id)
      .single();

    if (!user || !item) {
      return NextResponse.json(
        { success: false, message: "Invalid user or item" },
        { status: 400 }
      );
    }

    // Insert order
    const { data: order, error: orderError } = await supabaseServer
      .from("orders")
      .insert([
        {
          user_id: userId,
          user_name: user.name,
          item_id: item.id,
          item_name: item.name,
          category: item.category,
          quantity,
          seat: user.seat,
          temperature,
          drink_type,
          sugar,
          food_type,
          notes,
        },
      ])
      .select()
      .single();

    if (orderError) {
      return NextResponse.json(
        { success: false, message: orderError.message },
        { status: 500 }
      );
    }

    // Fetch staff tokens
    const { data: staffUsers, error: staffError } = await supabaseServer
      .from("users")
      .select("fcm_token")
      .eq("role", "staff")
      .not("fcm_token", "is", null);

    if (staffError) {
      console.error("Error fetching staff tokens:", staffError);
    }

    // Remove duplicates + nulls
    const tokens = [
      ...new Set(staffUsers?.map((u) => u.fcm_token).filter(Boolean)),
    ] as string[];

    // Send FCM
    if (tokens.length > 0) {
      const message = {
        tokens,
        notification: {
          title: "☕ New Order Received!",
          body: `${user.name} placed ${quantity} x ${item.name}`,
        },
        data: {
          title: "☕ New Order Received!",
          body: `${user.name} placed ${quantity} x ${item.name}`,
          orderId: String(order.id),
        },
        webpush: {
          notification: {
            title: "☕ New Order Received!",
            body: `${user.name} placed ${quantity} x ${item.name}`,
            icon: "/logo.png",
            badge: "/logo.png",
            requireInteraction: true,
          },
        },
      };

      try {
        const fcmResponse = await admin
          .messaging()
          .sendEachForMulticast(message);

        console.log("✅ Order FCM success:", fcmResponse.successCount);
        console.log("❌ Order FCM failure:", fcmResponse.failureCount);

        // Cleanup failed tokens
        if (fcmResponse.failureCount > 0) {
          const failedTokens: string[] = [];

          fcmResponse.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(tokens[idx]);
            }
          });

          console.log("⚠️ Failed tokens:", failedTokens);

        }
      } catch (fcmError) {
        console.error("FCM send error:", fcmError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        order,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 }
    );
  }
}