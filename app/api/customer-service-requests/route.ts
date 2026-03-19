// app/api/service-request/route.ts
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
    // Verify the user
    const { userId } = await verifyToken(req);
    console.log('ccjcjcj');
    // Get request data
    const { service, seat, notes } = await req.json();

    if (!service || !seat) {
      return NextResponse.json(
        { success: false, message: "Service and seat required" },
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

    // Insert service request
    const { data: request, error: insertError } = await supabaseServer
      .from("customer_service_requests")
      .insert([
        {
          user_id: userId,
          user_name: user.name,
          service,
          seat,
          notes,
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

    // ✅ Fetch staff FCM tokens
    const { data: staffTokens, error: staffError } = await supabaseServer
      .from("users")
      .select("fcm_token")
      .eq("role", "staff")
      .not("fcm_token", "is", null);
    console.log('ccc',staffTokens);
    if (staffError) {
      console.error("Error fetching staff tokens:", staffError);
    }

    const tokens = staffTokens?.map((t) => t.fcm_token).filter(Boolean) || [];
         console.log('cheheh',tokens);
    // ✅ Send FCM notification to staff
    if (tokens.length > 0) {
      const message = {
        tokens,
        notification: {
          title: "🛠 New Service Request",
          body: `${user.name} requested ${service} at seat ${seat}`,
        },
        data: { requestId: request.id.toString() },
      };

      try {
        const fcmResponse = await admin.messaging().sendEachForMulticast(message);
        console.log("Service FCM sent:", fcmResponse.successCount);
      } catch (fcmError) {
        console.error("FCM send error:", fcmError);
      }
    }

    return NextResponse.json({ success: true, request }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}