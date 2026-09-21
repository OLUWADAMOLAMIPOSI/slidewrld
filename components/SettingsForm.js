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

export default function SettingsForm({ settings }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState(settings);
  const [heroImage, setHeroImage] = useState(settings.heroImage || "");
  const [editorialVideos, setEditorialVideos] = useState(settings.editorialVideos || []);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Upload failed.");
    }
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

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, heroImage, editorialVideos }),
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
          These play in a row on the homepage below the tagline. Keep clips short and
          under 50MB each for fast loading. Add as many as you like.
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