import { NextResponse } from "next/server";
import { finalizeOpayPayment } from "@/lib/finalizeOpay";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const reference = body?.payload?.reference || body?.reference;

  if (reference) {
    try {
      await finalizeOpayPayment(String(reference));
    } catch (error) {
      console.error("OPay callback processing failed:", error);
    }
  }

  return NextResponse.json({ code: "00000", message: "SUCCESSFUL" });
}