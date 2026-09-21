"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Failed to subscribe");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-sm">
      <h3 className="mb-2 text-base">Join the list</h3>
      <p className="mb-4 text-sm text-muted">
        Get notified when new drops and offers go live.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full border border-line bg-surface px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="whitespace-nowrap bg-ink px-4 py-2 text-sm text-paper disabled:opacity-60"
        >
          {status === "loading" ? "Sending" : "Subscribe"}
        </button>
      </form>
      {status === "success" && (
        <p className="mt-2 text-xs text-muted">You are on the list.</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-muted">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
