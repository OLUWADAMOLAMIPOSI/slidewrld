"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContext";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function OrderStatusForm({ orderId, currentStatus }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update status.");
        return;
      }
      showToast("Status updated");
      router.refresh();
    } catch {
      setError("Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="border border-line bg-surface px-3 py-2 text-sm capitalize"
      >
        {STATUSES.map((option) => (
          <option key={option} value={option} className="capitalize">
            {option}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={saving}
        className="bg-ink px-4 py-2 text-sm text-paper disabled:opacity-60"
      >
        {saving ? "Updating" : "Update status"}
      </button>
      {error && <p className="text-sm text-muted">{error}</p>}
    </form>
  );
}