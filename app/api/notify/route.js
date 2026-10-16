import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { writeData } from "@/lib/db";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const item = String(body.item || "").slice(0, 120);

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  await writeData((data) => {
    if (!Array.isArray(data.subscribers)) data.subscribers = [];

    const existing = data.subscribers.find((s) => (s.email || "").toLowerCase() === email);

    if (existing) {
      if (item) {
        existing.interests = Array.from(new Set([...(existing.interests || []), item]));
      }
      return;
    }

    data.subscribers.push({
      id: uuid(),
      email,
      source: item ? `Notify: ${item}` : "Notify",
      interests: item ? [item] : [],
      createdAt: new Date().toISOString(),
    });
  });

  return NextResponse.json({ success: true });
}