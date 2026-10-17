"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartContext";

export default function ClearCartOnVisit() {
  const { clearCart } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("clear") === "1") {
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}