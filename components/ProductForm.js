"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/ToastContext";

export default function ProductForm({ product, productId }) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditing = Boolean(productId);

  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price || "",
    compareAtPrice: product?.compareAtPrice || "",
    description: product?.description || "",
    sizes: product?.sizes?.join(", ") || "",
    featured: product?.featured || false,
    bestSeller: product?.bestSeller || false,
    inStock: product?.inStock !== undefined ? product.inStock : true,
  });
  const [images, setImages] = useState(product?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Image upload failed.");
        return;
      }

      setImages((current) => [...current, data.url]);
    } catch {
      setError("Image upload failed.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(url) {
    setImages((current) => current.filter((image) => image !== url));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      description: form.description,
      sizes: form.sizes
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean),
      images,
      featured: form.featured,
      bestSeller: form.bestSeller,
      inStock: form.inStock,
    };

    try {
      const response = await fetch(
        isEditing ? `/api/products/${productId}` : "/api/products",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        setStatus("idle");
        return;
      }

      showToast(isEditing ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setStatus("idle");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    showToast("Product deleted");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <div>
        <label className="mb-1 block text-sm text-muted">Name</label>
        <input
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          className="w-full border border-line bg-surface px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">Category</label>
          <input
            name="category"
            required
            value={form.category}
            onChange={handleChange}
            className="w-full border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Sizes (comma separated)</label>
          <input
            name="sizes"
            value={form.sizes}
            onChange={handleChange}
            placeholder="40, 41, 42"
            className="w-full border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted">Price (NGN)</label>
          <input
            name="price"
            type="number"
            min="0"
            required
            value={form.price}
            onChange={handleChange}
            className="w-full border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Compare-at price (optional)</label>
          <input
            name="compareAtPrice"
            type="number"
            min="0"
            value={form.compareAtPrice}
            onChange={handleChange}
            className="w-full border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">Description</label>
        <textarea
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
          className="w-full border border-line bg-surface px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">Images</label>
        <div className="flex flex-wrap gap-3">
          {images.map((image) => (
            <div key={image} className="relative h-24 w-20 overflow-hidden border border-line">
              <Image src={image} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(image)}
                className="absolute right-1 top-1 bg-paper px-1 text-xs"
              >
                x
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isUploading}
          className="mt-3 text-sm"
        />
        {isUploading && <p className="mt-1 text-xs text-muted">Uploading...</p>}
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="featured"
            checked={form.featured}
            onChange={handleChange}
          />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="bestSeller"
            checked={form.bestSeller}
            onChange={handleChange}
          />
          Show in best sellers
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="inStock"
            checked={form.inStock}
            onChange={handleChange}
          />
          In stock
        </label>
      </div>

      {error && <p className="text-sm text-muted">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-ink px-5 py-2.5 text-sm text-paper disabled:opacity-60"
        >
          {status === "loading" ? "Saving" : isEditing ? "Save changes" : "Create product"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm text-muted underline"
          >
            Delete product
          </button>
        )}
      </div>
    </form>
  );
}