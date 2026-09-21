"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContext";

const NEXT_STATUS = {
  pending: { next: "paid", label: "Mark paid" },
  paid: { next: "shipped", label: "Mark shipped" },
  shipped: { next: "delivered", label: "Mark delivered" },
};

export default function QuickOrderStatusButton({ orderId, status }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const action = NEXT_STATUS[status];

  async function handleClick() {
    if (!action) return;
    setIsUpdating(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action.next }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update.");
        setIsUpdating(false);
        return;
      }

      showToast("Status updated");
      router.refresh();
    } catch {
      setError("Failed to update.");
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="capitalize">{status}</span>
      {action && (
        <button
          type="button"
          onClick={handleClick}
          disabled={isUpdating}
          className="border border-line px-2 py-1 text-xs hover:border-ink disabled:opacity-50"
        >
          {isUpdating ? "Updating" : action.label}
        </button>
      )}
      {error && <span className="text-xs text-muted">{error}</span>}
    </div>
  );
}