// import { NextResponse } from "next/server";
// import { supabaseServer } from "@/lib/supabase-server";
// import { verifyToken } from "@/lib/auth";

// export async function POST(req: Request) {
//   try {
//     const { userId } = await verifyToken(req);

//     const body = await req.json();
//     const { service, seat, notes } = body;

//     if (!service || !seat) {
//       return NextResponse.json({
//         success: false,
//         message: "Service and seat required",
//       });
//     }

//     const { data: user } = await supabaseServer
//       .from("users")
//       .select("name")
//       .eq("id", userId)
//       .single();

//     const { data, error } = await supabaseServer
//       .from("customer_service_requests")
//       .insert([
//         {
//           user_id: userId,
//           user_name: user?.name || "",
//           service,
//           seat,
//           notes,
//           status: "Pending",
//         },
//       ])
//       .select()
//       .single();

//     if (error) {
//       return NextResponse.json({
//         success: false,
//         message: error.message,
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       request: data,
//     });
//   } catch (error: any) {
//     return NextResponse.json({
//       success: false,
//       message: error.message,
//     });
//   }
// }


import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyToken } from "@/lib/auth";
import admin from "firebase-admin";



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
    const { userId } = await verifyToken(req);

    const body = await req.json();
    const { service, seat, notes } = body;

    if (!service || !seat) {
      return NextResponse.json({
        success: false,
        message: "Service and seat required",
      });
    }

    // Get user info
    const { data: user } = await supabaseServer
      .from("users")
      .select("name")
      .eq("id", userId)
      .single();

    // Insert service request
    const { data, error } = await supabaseServer
      .from("customer_service_requests")
      .insert([
        {
          user_id: userId,
          user_name: user?.name || "",
          service,
          seat,
          notes,
          status: "Pending",
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

    // ✅ Send notification to staff
    const { data: staffTokens } = await supabaseServer
      .from("users")
      .select("fcm_token")
      .not("fcm_token", "is", null); // Only staff with tokens

    const tokens = staffTokens.map((t) => t.fcm_token).filter(Boolean);

    if (tokens.length > 0) {
      const message = {
        tokens,
        notification: {
          title: "🛠 New Service Request",
          body: `${user?.name || "A user"} requested ${service} at seat ${seat}`,
        },
        data: { requestId: data.id.toString() },
      };

      await admin.messaging().sendMulticast(message);
    }

    return NextResponse.json({
      success: true,
      request: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}