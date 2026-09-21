import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file was sent." }, { status: 400 });
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only jpg, png, webp, gif images or mp4, webm, mov videos are allowed." },
      { status: 400 }
    );
  }

  const maxBytes = file.type.startsWith("video/") ? 50 * 1024 * 1024 : 8 * 1024 * 1024;
  if (file.size > maxBytes) {
    const limitLabel = file.type.startsWith("video/") ? "50MB" : "8MB";
    return NextResponse.json(
      { error: `File is too large. Keep it under ${limitLabel}.` },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const extensionMap = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
  };
  const extension = extensionMap[file.type] || "";
  const filename = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("uploads")
    .upload(filename, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json(
      { error: "Upload failed: " + uploadError.message },
      { status: 500 }
    );
  }

  const { data } = supabase.storage.from("uploads").getPublicUrl(filename);

  return NextResponse.json({ url: data.publicUrl });
}