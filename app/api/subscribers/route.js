import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";
import { sendNewsletterWelcomeEmail } from "@/lib/mail";

export async function POST(request) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const data = await readData();
  const alreadySubscribed = data.subscribers.some(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  );

  if (!alreadySubscribed) {
    await writeData((data) => {
      data.subscribers.push({ email, subscribedAt: new Date().toISOString() });
    });
    try {
      await sendNewsletterWelcomeEmail(email);
    } catch (error) {
      console.error("Newsletter welcome email failed to send:", error);
    }
  }

  return NextResponse.json({ success: true });
}
