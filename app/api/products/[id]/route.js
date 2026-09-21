import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(request, { params }) {
  const data = await readData();
  const product = data.products.find((p) => p.id === params.id);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PUT(request, { params }) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json();
  let updated = null;

  await writeData((data) => {
    const product = data.products.find((p) => p.id === params.id);
    if (!product) return;
    product.name = body.name ?? product.name;
    product.category = body.category ?? product.category;
    product.price = body.price !== undefined ? Number(body.price) : product.price;
    product.compareAtPrice =
      body.compareAtPrice !== undefined
        ? body.compareAtPrice
          ? Number(body.compareAtPrice)
          : null
        : product.compareAtPrice;
    product.description = body.description ?? product.description;
    product.images = body.images ?? product.images;
    product.sizes = body.sizes ?? product.sizes;
    product.featured = body.featured !== undefined ? Boolean(body.featured) : product.featured;
    product.bestSeller =
      body.bestSeller !== undefined ? Boolean(body.bestSeller) : product.bestSeller;
    product.inStock = body.inStock !== undefined ? Boolean(body.inStock) : product.inStock;
    updated = product;
  });

  if (!updated) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ product: updated });
}

export async function DELETE(request, { params }) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let removed = false;
  await writeData((data) => {
    const before = data.products.length;
    data.products = data.products.filter((p) => p.id !== params.id);
    removed = data.products.length < before;
  });

  if (!removed) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
