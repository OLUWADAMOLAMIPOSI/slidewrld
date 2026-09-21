import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { readData, writeData } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET() {
  const data = await readData();
  return NextResponse.json({ products: data.products });
}

export async function POST(request) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json();

  if (!body.name || !body.price || !body.category) {
    return NextResponse.json(
      { error: "Name, category, and price are required." },
      { status: 400 }
    );
  }

  const product = {
    id: uuid(),
    slug: slugify(body.name) + "-" + Math.random().toString(36).slice(2, 6),
    name: body.name,
    category: body.category,
    price: Number(body.price),
    compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : null,
    description: body.description || "",
    images: body.images || [],
    sizes: body.sizes || [],
    featured: Boolean(body.featured),
    bestSeller: Boolean(body.bestSeller),
    inStock: body.inStock !== undefined ? Boolean(body.inStock) : true,
    createdAt: new Date().toISOString(),
  };

  await writeData((data) => {
    data.products.unshift(product);
  });

  return NextResponse.json({ product }, { status: 201 });
}
