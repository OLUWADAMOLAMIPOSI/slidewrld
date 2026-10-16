"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/ToastContext";
import { PRESET_COLORS, swatchColor } from "@/lib/colors";

export default function ProductForm({ product, productId }) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditing = Boolean(productId);

  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price || "",
    stock: product?.stock ?? "",    compareAtPrice: product?.compareAtPrice || "",
    description: product?.description || "",
    sizes: product?.sizes?.join(", ") || "",
    featured: product?.featured || false,
    bestSeller: product?.bestSeller || false,
    inStock: product?.inStock !== undefined ? product.inStock : true,
  });
  const [images, setImages] = useState(product?.images || []);
  const [colors, setColors] = useState(product?.colors || []);
  const [newColorName, setNewColorName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingColorIndex, setUploadingColorIndex] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Upload failed.");
    return data.url;
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError("");
    try {
      const url = await uploadFile(file);
      setImages((current) => [...current, url]);
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(url) {
    setImages((current) => current.filter((image) => image !== url));
  }

  function addColor(name, hex) {
    const cleanName = name.trim();
    if (!cleanName) return;
    if (colors.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
      setError("That color is already added.");
      return;
    }
    setColors((current) => [...current, { name: cleanName, hex: hex || "", images: [] }]);
    setError("");
  }

  function removeColor(index) {
    setColors((current) => current.filter((_, i) => i !== index));
  }

  async function handleColorImageUpload(event, colorIndex) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingColorIndex(colorIndex);
    setError("");
    try {
      const url = await uploadFile(file);
      setColors((current) =>
        current.map((color, i) =>
          i === colorIndex ? { ...color, images: [...color.images, url] } : color
        )
      );
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed.");
    } finally {
      setUploadingColorIndex(null);
      event.target.value = "";
    }
  }

  function removeColorImage(colorIndex, url) {
    setColors((current) =>
      current.map((color, i) =>
        i === colorIndex
          ? { ...color, images: color.images.filter((image) => image !== url) }
          : color
      )
    );
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
      sizes: form.sizes.split(",").map((size) => size.trim()).filter(Boolean),
      images,
      colors,
      featured: form.featured,
      bestSeller: form.bestSeller,
      stock: form.stock === "" ? null : Number(form.stock),
      inStock: form.stock !== "" ? Number(form.stock) > 0 : form.inStock,
    };

    try {
      const response = await fetch(isEditing ? `/api/products/${productId}` : "/api/products", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
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
        <label className="mb-1 block text-sm text-muted">
          Stock available (leave empty for unlimited)
        </label>
        <input
          name="stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={handleChange}
          placeholder="e.g. 20"
          className="w-full border border-line bg-surface px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-muted">
          Each order reduces this number. At 0 the product is marked out of stock automatically.
        </p>
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
        <label className="mb-1 block text-sm text-muted">
          Main images (shown when the product has no colors)
        </label>
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

      <div className="border border-line p-4">
        <label className="mb-1 block text-sm">Colors</label>
        <p className="mb-3 text-xs text-muted">
          Pick each color this product comes in, then upload its photos under that color.
          Customers choose from these colors on the product page.
        </p>

        <p className="mb-2 text-xs text-muted">Pick the colors this product comes in:</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((preset) => {
            const added = colors.some(
              (c) => c.name.toLowerCase() === preset.name.toLowerCase()
            );
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => addColor(preset.name, preset.hex)}
                disabled={added}
                className={`flex items-center gap-2 border px-3 py-1.5 text-xs ${
                  added ? "border-ink opacity-50" : "border-line"
                }`}
              >
                <span
                  className="h-3 w-3 border border-line"
                  style={{ backgroundColor: preset.hex }}
                />
                {preset.name}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={newColorName}
            onChange={(event) => setNewColorName(event.target.value)}
            placeholder="Other color, e.g. Forest Green"
            className="w-full border border-line bg-surface px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              addColor(newColorName, "");
              setNewColorName("");
            }}
            className="whitespace-nowrap border border-line px-4 py-2 text-sm"
          >
            Add
          </button>
        </div>

        {colors.length > 0 && (
          <div className="mt-5 flex flex-col gap-4">
            <p className="text-xs text-muted">Upload photos for each color:</p>
            {colors.map((color, index) => (
              <div key={color.name} className="border border-line p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm">
                    <span
                      className="h-3 w-3 border border-line"
                      style={{ backgroundColor: swatchColor(color) }}
                    />
                    {color.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeColor(index)}
                    className="text-xs text-muted underline"
                  >
                    Remove color
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {color.images.map((image) => (
                    <div
                      key={image}
                      className="relative h-20 w-16 overflow-hidden border border-line"
                    >
                      <Image src={image} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeColorImage(index, image)}
                        className="absolute right-0.5 top-0.5 bg-paper px-1 text-[10px]"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleColorImageUpload(event, index)}
                  disabled={uploadingColorIndex === index}
                  className="mt-2 text-xs"
                />
                {uploadingColorIndex === index && (
                  <p className="mt-1 text-xs text-muted">Uploading...</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="bestSeller" checked={form.bestSeller} onChange={handleChange} />
          Show in best sellers
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleChange} />
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
          <button type="button" onClick={handleDelete} className="text-sm text-muted underline">
            Delete product
          </button>
        )}
      </div>
    </form>
  );
}