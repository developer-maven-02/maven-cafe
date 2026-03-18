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

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";
import admin from "firebase-admin";
import serviceAccount from "@/lib/serviceAccountKey.json" assert { type: "json" };

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Replace this with all active staff FCM tokens (store in DB in production)
const STAFF_FCM_TOKENS = [
  "cjKkyLuzd3k1btAKFipfXk:APA91bF7ubf0EQNrywH2R4x9Tf1zmfsIzs0gB3C1l7QHeAGIcm8d1rb-PVgv4G46L0cC_8quqtRJkF2lDOgf4v-mQ9fhICAfNN6wwlOFe7UrKzMknB9hAVA"
];

export async function POST(req: Request) {
  try {
    const { userId } = await verifyToken(req);

    const body = await req.json();

    const {
      item_id,
      quantity,
      temperature,
      drink_type,
      sugar,
      food_type,
      notes,
    } = body;

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
        { status: 200 }
      );
    }

    // Insert order
    const { data, error } = await supabaseServer
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

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 200 });
    }

    // ✅ Send FCM notification to staff
    try {
      const message = {
        tokens: STAFF_FCM_TOKENS,
        notification: {
          title: "☕ New Order Received!",
          body: `${user.name} placed ${quantity} x ${item.name}`,
        },
        data: { orderId: data.id.toString() },
      };

      const fcmResponse = await admin.messaging().sendMulticast(message);
      console.log("Notification sent:", fcmResponse);
    } catch (fcmError) {
      console.error("FCM error:", fcmError);
    }

    return NextResponse.json(
      { success: true, message: "Order placed successfully", order: data },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}