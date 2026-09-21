"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Incorrect email or password.");
        setStatus("idle");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="mb-6 text-xl">SlideWrld admin</h1>
        <div className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="border border-line bg-surface px-3 py-2 text-sm"
          />
          <input
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="border border-line bg-surface px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-muted">{error}</p>}
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-ink py-3 text-sm text-paper disabled:opacity-60"
          >
            {status === "loading" ? "Signing in" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
