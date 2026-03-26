import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// ✅ GET all items
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("GET Server error:", err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}

// ✅ POST new item with optional image upload
export async function POST(req: Request) {
  try {
    // Make sure front-end sends FormData (Content-Type multipart/form-data)
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const is_available = formData.get("is_available") as string;
    const price = formData.get("price") as string;
    const file = formData.get("image") as File | null; // uploaded file
    let imageUrl = null;

    if (file) {
      // Convert file to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const imageName = `${Date.now()}_${file.name}`;

      const { data: uploadData, error: uploadError } = await supabaseServer.storage
        .from("item-images")
        .upload(imageName, buffer, {
          contentType: file.type || "image/png",
          upsert: true,
        });

      if (uploadError) {
        return NextResponse.json({ success: false, message: uploadError.message });
      }

      // Get public URL
      const { data: publicData } = supabaseServer.storage
        .from("item-images")
        .getPublicUrl(imageName);

      imageUrl = publicData.publicUrl;
    }

    // Insert into Supabase DB
    const { data: itemData, error: dbError } = await supabaseServer
      .from("items")
      .insert([{ name, description, category,    price,
 is_available, image: imageUrl }])
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ success: false, message: dbError.message });
    }

    return NextResponse.json({ success: true, message: "Item added", data: itemData });
  } catch (err) {
    console.error("POST Server error:", err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}