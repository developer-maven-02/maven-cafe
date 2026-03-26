import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// ✅ GET single item
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabaseServer
      .from("items")
      .select("*")
      .eq("id", id)
      .single();
      console.log('check data item:', data);
    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message
      });
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch {
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}


// ✅ UPDATE item

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // ✅ Parse FormData
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const is_available = formData.get("is_available") as string;
    const price = formData.get("price") as string;

    const file = formData.get("image") as File | null;
    let imageUrl: string | null = null;

    // ✅ Upload new image if provided
    if (file) {
      // Optional: check file size < 2 MB
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ success: false, message: "Image size must be ≤ 2 MB" });
      }

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

      const { data: publicData } = supabaseServer.storage
        .from("item-images")
        .getPublicUrl(imageName);

      imageUrl = publicData.publicUrl;
    }

    // ✅ Update item in Supabase DB
    const { data, error } = await supabaseServer
      .from("items")
      .update({
        name,
        description,
        category,
        is_available,
        price,
        image: imageUrl ?? undefined, // keep old image if no new file
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message });
    }

    return NextResponse.json({
      success: true,
      message: "Item updated successfully",
      data,
    });
  } catch (err) {
    console.error("PUT Server error:", err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}


// ✅ DELETE item
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { error } = await supabaseServer
      .from("items")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully"
    });

  } catch {
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}