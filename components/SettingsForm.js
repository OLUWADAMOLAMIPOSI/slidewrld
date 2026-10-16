"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/ToastContext";

const FIELDS = [
  { name: "storeName", label: "Store name", type: "text" },
  { name: "tagline", label: "Tagline", type: "text" },
  { name: "heroHeading", label: "Hero heading", type: "text" },
  { name: "heroSubheading", label: "Hero subheading", type: "text" },
  { name: "contactEmail", label: "Contact email", type: "text" },
  { name: "instagram", label: "Instagram URL", type: "text" },
  { name: "tiktok", label: "TikTok URL", type: "text" },
  { name: "twitter", label: "X (Twitter) URL", type: "text" },
  { name: "whatsapp", label: "WhatsApp URL", type: "text" },
  { name: "bankName", label: "Bank name", type: "text" },
  { name: "bankAccountName", label: "Bank account name", type: "text" },
  { name: "bankAccountNumber", label: "Bank account number", type: "text" },
  { name: "aboutText", label: "About page text", type: "textarea" },
  { name: "shippingPolicy", label: "Shipping policy", type: "textarea" },
  { name: "refundPolicy", label: "Refund policy", type: "textarea" },
  { name: "privacyPolicy", label: "Privacy policy", type: "textarea" },
  { name: "termsOfService", label: "Terms of service", type: "textarea" },
];

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

const DEFAULT_FUN_FACTS = [
  { id: "f1", number: 10000, suffix: "", label: "steps our slides can survive" },
  { id: "f2", number: 500, suffix: "+", label: "happy customers" },
  { id: "f3", number: 36, suffix: "", label: "states we deliver to" },
];

const DEFAULT_STYLE_GUIDE = [
  {
    id: "s1",
    title: "Big boy purchase",
    description: "Bold, chunky and loud. Statement slides that walk in before you do.",
    href: "/products",
    image: "",
  },
  {
    id: "s2",
    title: "Everyday casual",
    description: "Easy slides for errands, hangouts and lazy weekends.",
    href: "/products",
    image: "",
  },
  {
    id: "s3",
    title: "Clean and classy",
    description: "Minimal, polished pairs that dress up any outfit.",
    href: "/products",
    image: "",
  },
  {
    id: "s4",
    title: "We sell socks too",
    description: "Finish the look. Pair your slides with the right socks.",
    href: "/products",
    image: "",
  },
];

export default function SettingsForm({ settings, products = [] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState(settings);
  const [heroImage, setHeroImage] = useState(settings.heroImage || "");
  const [editorialVideos, setEditorialVideos] = useState(settings.editorialVideos || []);
  const [sectionDescriptions, setSectionDescriptions] = useState(
    settings.sectionDescriptions || { newArrivals: "", bestSellers: "" }
  );
  const [showcaseProductId, setShowcaseProductId] = useState(settings.showcaseProductId || "");
  const [brands, setBrands] = useState(settings.brands || []);
  const [newBrandName, setNewBrandName] = useState("");
  const [sneakPeeks, setSneakPeeks] = useState(settings.sneakPeeks || []);
  const [funFacts, setFunFacts] = useState(settings.funFacts || DEFAULT_FUN_FACTS);
  const [styleGuide, setStyleGuide] = useState(settings.styleGuide || DEFAULT_STYLE_GUIDE);

  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadingBrandIndex, setUploadingBrandIndex] = useState(null);
  const [uploadingPeekId, setUploadingPeekId] = useState(null);
  const [uploadingStyleId, setUploadingStyleId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const productsWithMultipleColors = products.filter((p) => (p.colors?.length || 0) > 1);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Upload failed.");
    return data.url;
  }

  async function handleHeroImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingHero(true);
    setError("");
    try {
      const url = await uploadFile(file);
      setHeroImage(url);
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed.");
    } finally {
      setIsUploadingHero(false);
      event.target.value = "";
    }
  }

  async function handleVideoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingVideo(true);
    setError("");
    try {
      const url = await uploadFile(file);
      setEditorialVideos((current) => [...current, url]);
    } catch (uploadError) {
      setError(uploadError.message || "Video upload failed.");
    } finally {
      setIsUploadingVideo(false);
      event.target.value = "";
    }
  }

  function removeVideo(url) {
    setEditorialVideos((current) => current.filter((video) => video !== url));
  }

  function handleSectionDescriptionChange(key, value) {
    setSectionDescriptions((current) => ({ ...current, [key]: value }));
  }

  function addBrand() {
    const name = newBrandName.trim();
    if (!name) return;
    setBrands((current) => [...current, { name, logo: "" }]);
    setNewBrandName("");
  }

  function removeBrand(index) {
    setBrands((current) => current.filter((_, i) => i !== index));
  }

  async function handleBrandLogoUpload(event, index) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingBrandIndex(index);
    setError("");
    try {
      const url = await uploadFile(file);
      setBrands((current) =>
        current.map((brand, i) => (i === index ? { ...brand, logo: url } : brand))
      );
    } catch (uploadError) {
      setError(uploadError.message || "Logo upload failed.");
    } finally {
      setUploadingBrandIndex(null);
      event.target.value = "";
    }
  }

  function addSneakPeek() {
    setSneakPeeks((current) => [
      ...current,
      { id: newId(), title: "New drop", description: "", date: "", image: "" },
    ]);
  }

  function updateSneakPeek(id, field, value) {
    setSneakPeeks((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function removeSneakPeek(id) {
    setSneakPeeks((current) => current.filter((item) => item.id !== id));
  }

  async function handleSneakPeekImageUpload(event, id) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingPeekId(id);
    setError("");
    try {
      const url = await uploadFile(file);
      updateSneakPeek(id, "image", url);
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed.");
    } finally {
      setUploadingPeekId(null);
      event.target.value = "";
    }
  }

  function addFunFact() {
    setFunFacts((current) => [...current, { id: newId(), number: 0, suffix: "", label: "" }]);
  }

  function updateFunFact(id, field, value) {
    setFunFacts((current) =>
      current.map((fact) => (fact.id === id ? { ...fact, [field]: value } : fact))
    );
  }

  function removeFunFact(id) {
    setFunFacts((current) => current.filter((fact) => fact.id !== id));
  }

  function updateStyleItem(id, field, value) {
    setStyleGuide((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function removeStyleItem(id) {
    setStyleGuide((current) => current.filter((item) => item.id !== id));
  }

  function addStyleItem() {
    setStyleGuide((current) => [
      ...current,
      { id: newId(), title: "New style", description: "", href: "/products", image: "" },
    ]);
  }

  async function handleStyleImageUpload(event, id) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingStyleId(id);
    setError("");
    try {
      const url = await uploadFile(file);
      updateStyleItem(id, "image", url);
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed.");
    } finally {
      setUploadingStyleId(null);
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          heroImage,
          editorialVideos,
          sectionDescriptions,
          showcaseProductId: showcaseProductId || null,
          styleGuide,
          sneakPeeks,
          funFacts,
          brands,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to save settings.");
        setStatus("idle");
        return;
      }
      showToast("Settings saved");
      setStatus("idle");
      router.refresh();
    } catch {
      setError("Failed to save settings.");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <div>
        <label className="mb-1 block text-sm text-muted">Hero background image</label>
        {heroImage && (
          <div className="relative mb-3 h-40 w-full overflow-hidden border border-line">
            <Image src={heroImage} alt="" fill className="object-cover" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleHeroImageUpload}
          disabled={isUploadingHero}
          className="text-sm"
        />
        {isUploadingHero && <p className="mt-1 text-xs text-muted">Uploading...</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">Homepage videos</label>
        <p className="mb-2 text-xs text-muted">
          These play in a row on the homepage below the tagline. Keep clips short and under 50MB
          each for fast loading.
        </p>
        <div className="mb-3 flex flex-wrap gap-3">
          {editorialVideos.map((video) => (
            <div key={video} className="relative h-24 w-20 overflow-hidden border border-line">
              <video src={video} muted className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeVideo(video)}
                className="absolute right-1 top-1 bg-paper px-1 text-xs"
              >
                x
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          disabled={isUploadingVideo}
          className="text-sm"
        />
        {isUploadingVideo && <p className="mt-1 text-xs text-muted">Uploading...</p>}
      </div>

      <div className="border border-line p-4">
        <label className="mb-1 block text-sm">Section descriptions</label>
        <p className="mb-3 text-xs text-muted">Shown centered under each section headline.</p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1 text-xs text-muted">New arrivals description</p>
            <input
              value={sectionDescriptions.newArrivals || ""}
              onChange={(event) => handleSectionDescriptionChange("newArrivals", event.target.value)}
              className="w-full border border-line bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-muted">Best sellers description</p>
            <input
              value={sectionDescriptions.bestSellers || ""}
              onChange={(event) => handleSectionDescriptionChange("bestSellers", event.target.value)}
              className="w-full border border-line bg-surface px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="border border-line p-4">
        <label className="mb-1 block text-sm">Multi-color showcase</label>
        <p className="mb-3 text-xs text-muted">
          Pick a product with more than one color to feature in a full-width showcase on the
          homepage, right below the trust badges. Leave blank to hide this section.
        </p>
        <select
          value={showcaseProductId}
          onChange={(event) => setShowcaseProductId(event.target.value)}
          className="w-full border border-line bg-surface px-3 py-2 text-sm"
        >
          <option value="">None</option>
          {productsWithMultipleColors.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
        {productsWithMultipleColors.length === 0 && (
          <p className="mt-2 text-xs text-muted">
            No products have more than one color yet. Add colors to a product first.
          </p>
        )}
      </div>

      <div className="border border-line p-4">
        <label className="mb-1 block text-sm">Find your style cards</label>
        <p className="mb-3 text-xs text-muted">
          Cards that suggest a look, such as big boy, casual, classy, or socks. Set the link to a
          page like /products or /collections/socks.
        </p>

        <p className="mb-1 text-xs text-muted">Section description</p>
        <input
          value={sectionDescriptions.styleGuide || ""}
          onChange={(event) => handleSectionDescriptionChange("styleGuide", event.target.value)}
          className="mb-4 w-full border border-line bg-surface px-3 py-2 text-sm"
        />

        <div className="flex flex-col gap-4">
          {styleGuide.map((item) => (
            <div key={item.id} className="border border-line p-3">
              <div className="mb-2 flex items-center gap-3">
                <input
                  value={item.title}
                  onChange={(event) => updateStyleItem(item.id, "title", event.target.value)}
                  placeholder="Card title"
                  className="w-full border border-line bg-surface px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeStyleItem(item.id)}
                  className="whitespace-nowrap text-xs text-muted underline"
                >
                  Remove
                </button>
              </div>
              <textarea
                value={item.description}
                onChange={(event) => updateStyleItem(item.id, "description", event.target.value)}
                placeholder="Short description"
                rows={2}
                className="mb-2 w-full border border-line bg-surface px-3 py-2 text-sm"
              />
              <input
                value={item.href}
                onChange={(event) => updateStyleItem(item.id, "href", event.target.value)}
                placeholder="Link, e.g. /products"
                className="mb-2 w-full border border-line bg-surface px-3 py-2 text-sm"
              />
              {item.image && (
                <div className="relative mb-2 h-24 w-20 overflow-hidden border border-line">
                  <Image src={item.image} alt="" fill className="object-cover" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleStyleImageUpload(event, item.id)}
                disabled={uploadingStyleId === item.id}
                className="text-xs"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStyleItem}
          className="mt-3 border border-line px-4 py-2 text-sm"
        >
          Add style card
        </button>
      </div>

      <div className="border border-line p-4">
        <label className="mb-1 block text-sm">Sneak peek (coming soon cards)</label>
        <p className="mb-3 text-xs text-muted">
          Customers can leave their email on each card. Sign-ups appear in Subscribers.
        </p>

        <p className="mb-1 text-xs text-muted">Section description</p>
        <input
          value={sectionDescriptions.sneakPeek || ""}
          onChange={(event) => handleSectionDescriptionChange("sneakPeek", event.target.value)}
          className="mb-4 w-full border border-line bg-surface px-3 py-2 text-sm"
        />

        <div className="flex flex-col gap-4">
          {sneakPeeks.map((item) => (
            <div key={item.id} className="border border-line p-3">
              <div className="mb-2 flex items-center gap-3">
                <input
                  value={item.title}
                  onChange={(event) => updateSneakPeek(item.id, "title", event.target.value)}
                  placeholder="Product name"
                  className="w-full border border-line bg-surface px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeSneakPeek(item.id)}
                  className="whitespace-nowrap text-xs text-muted underline"
                >
                  Remove
                </button>
              </div>
              <input
                value={item.date}
                onChange={(event) => updateSneakPeek(item.id, "date", event.target.value)}
                placeholder="Drop date, e.g. Drops 1 December"
                className="mb-2 w-full border border-line bg-surface px-3 py-2 text-sm"
              />
              <textarea
                value={item.description}
                onChange={(event) => updateSneakPeek(item.id, "description", event.target.value)}
                placeholder="Short description"
                rows={2}
                className="mb-2 w-full border border-line bg-surface px-3 py-2 text-sm"
              />
              {item.image && (
                <div className="relative mb-2 h-24 w-20 overflow-hidden border border-line">
                  <Image src={item.image} alt="" fill className="object-cover" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleSneakPeekImageUpload(event, item.id)}
                disabled={uploadingPeekId === item.id}
                className="text-xs"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSneakPeek}
          className="mt-3 border border-line px-4 py-2 text-sm"
        >
          Add coming soon card
        </button>
      </div>

      <div className="border border-line p-4">
        <label className="mb-1 block text-sm">Fun facts</label>
        <p className="mb-3 text-xs text-muted">
          Each number counts up when the visitor scrolls to it. Example: number 10000, label
          "steps our slides can survive". Use the suffix for things like "+" or "%".
        </p>
        <div className="flex flex-col gap-3">
          {funFacts.map((fact) => (
            <div key={fact.id} className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={fact.number}
                onChange={(event) => updateFunFact(fact.id, "number", event.target.value)}
                className="w-24 border border-line bg-surface px-3 py-2 text-sm"
              />
              <input
                value={fact.suffix}
                onChange={(event) => updateFunFact(fact.id, "suffix", event.target.value)}
                placeholder="+"
                className="w-14 border border-line bg-surface px-3 py-2 text-sm"
              />
              <input
                value={fact.label}
                onChange={(event) => updateFunFact(fact.id, "label", event.target.value)}
                placeholder="Label"
                className="w-full border border-line bg-surface px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => removeFunFact(fact.id)}
                className="text-xs text-muted underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addFunFact}
          className="mt-3 border border-line px-4 py-2 text-sm"
        >
          Add fun fact
        </button>
      </div>

      <div className="border border-line p-4">
        <label className="mb-1 block text-sm">Brands</label>
        <p className="mb-3 text-xs text-muted">
          Shown as a scrollable row on the homepage with arrows once there are enough to overflow
          the screen.
        </p>
        <div className="flex flex-col gap-3">
          {brands.map((brand, index) => (
            <div key={brand.name + index} className="flex items-center gap-3 border border-line p-2">
              {brand.logo ? (
                <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden">
                  <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
                </div>
              ) : (
                <div className="h-12 w-16 flex-shrink-0 bg-surface" />
              )}
              <span className="flex-1 text-sm">{brand.name}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleBrandLogoUpload(event, index)}
                disabled={uploadingBrandIndex === index}
                className="text-xs"
              />
              <button
                type="button"
                onClick={() => removeBrand(index)}
                className="text-xs text-muted underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={newBrandName}
            onChange={(event) => setNewBrandName(event.target.value)}
            placeholder="Brand name"
            className="w-full border border-line bg-surface px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addBrand}
            className="whitespace-nowrap border border-line px-4 py-2 text-sm"
          >
            Add brand
          </button>
        </div>
      </div>

      {FIELDS.map((field) => (
        <div key={field.name}>
          <label className="mb-1 block text-sm text-muted">{field.label}</label>
          {field.type === "textarea" ? (
            <textarea
              name={field.name}
              rows={4}
              value={form[field.name] || ""}
              onChange={handleChange}
              className="w-full border border-line bg-surface px-3 py-2 text-sm"
            />
          ) : (
            <input
              name={field.name}
              value={form[field.name] || ""}
              onChange={handleChange}
              className="w-full border border-line bg-surface px-3 py-2 text-sm"
            />
          )}
        </div>
      ))}

      {error && <p className="text-sm text-muted">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="self-start bg-ink px-5 py-2.5 text-sm text-paper disabled:opacity-60"
      >
        {status === "loading" ? "Saving" : "Save settings"}
      </button>
    </form>
  );
}