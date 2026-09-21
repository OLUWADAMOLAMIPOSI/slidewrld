"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContext";

export default function DeleteOrderButton({ orderId }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this order? This cannot be undone.")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to delete order.");
        setIsDeleting(false);
        return;
      }
      showToast("Order deleted");
      router.push("/admin/orders");
      router.refresh();
    } catch {
      alert("Failed to delete order.");
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-xs text-muted underline disabled:opacity-50"
    >
      {isDeleting ? "Deleting" : "Delete"}
    </button>
  );
}