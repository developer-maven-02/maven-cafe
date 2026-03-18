// import { NextResponse } from "next/server";
// import { supabaseServer } from "@/lib/supabase-server";
// import { verifyToken } from "@/lib/auth";

// export async function POST(req: Request) {
//   try {
//     const { userId } = await verifyToken(req);

//     const body = await req.json();

//     const {
//       item_id,
//       quantity,
//       temperature,
//       drink_type,
//       sugar,
//       food_type,
//       notes,
//     } = body;

//     const { data: user } = await supabaseServer
//       .from("users")
//       .select("name, seat")
//       .eq("id", userId)
//       .single();

//     const { data: item } = await supabaseServer
//       .from("items")
//       .select("*")
//       .eq("id", item_id)
//       .single();

//     if (!user || !item) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid user or item",
//         },
//         { status: 200 }
//       );
//     }

//     const { data, error } = await supabaseServer
//       .from("orders")
//       .insert([
//         {
//           user_id: userId,
//           user_name: user.name,
//           item_id: item.id,
//           item_name: item.name,
//           category: item.category,
//           quantity,
//           seat: user.seat,
//           temperature,
//           drink_type,
//           sugar,
//           food_type,
//           notes,
//         },
//       ])
//       .select()
//       .single();

//     if (error) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: error.message,
//         },
//         { status: 200 }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Order placed successfully",
//         order: data,
//       },
//       { status: 200 }
//     );
//   } catch (error: any) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Server error",
//       },
//       { status: 500 }
//     );
//   }
// }

// app/api/order/route.ts
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
    // Verify staff or user
    const { userId } = await verifyToken(req);

    // Get order data from request
    const {
      item_id,
      quantity,
      temperature,
      drink_type,
      sugar,
      food_type,
      notes,
    } = await req.json();

    // Fetch user info
    const { data: user } = await supabaseServer
      .from("users")
      .select("name, seat")
      .eq("id", userId)
      .single();

    // Fetch item info
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

    // ✅ Fetch all staff FCM tokens
    const { data: staffUsers, error: staffError } = await supabaseServer
      .from("users")
      .select("fcm_token")
      .eq("role", "staff")
      .not("fcm_token", "is", null);

    if (staffError) {
      console.error("Error fetching staff tokens:", staffError);
    }

    const STAFF_FCM_TOKENS = staffUsers?.map((u) => u.fcm_token) || [];

    // ✅ Send FCM notification if tokens exist
    if (STAFF_FCM_TOKENS.length > 0) {
      try {
        const message = {
          tokens: STAFF_FCM_TOKENS,
          notification: {
            title: "☕ New Order Received!",
            body: `${user.name} placed ${quantity} x ${item.name}`,
          },
          data: { orderId: order.id.toString() },
        };

        const fcmResponse = await admin.messaging().sendEachForMulticast(message);
        console.log("FCM notification sent:", fcmResponse.successCount);
      } catch (fcmError) {
        console.error("FCM error:", fcmError);
      }
    }

    return NextResponse.json(
      { success: true, message: "Order placed successfully", order },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}