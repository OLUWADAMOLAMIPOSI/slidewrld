import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET()  {
  const data = await readData();
  return NextResponse.json({ settings: data.settings });
}

export async function PUT(request) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json();
  let updated = null;

  await writeData((data) => {
    data.settings = { ...data.settings, ...body };
    updated = data.settings;
  });

  return NextResponse.json({ settings: updated });
}
