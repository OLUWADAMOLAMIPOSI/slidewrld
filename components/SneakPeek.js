"use client";

import { useState } from "react";
import Image from "next/image";

function NotifyCard({ item }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, item: item.title }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="w-full sm:w-[300px]">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
        {item.image && (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 640px) 300px, 100vw"
            className="object-cover"
          />
        )}
        <span className="absolute left-3 top-3 bg-paper px-3 py-1 text-xs">Coming soon</span>
      </div>

      <div className="mt-4 text-center">
        <h3 className="text-base">{item.title}</h3>
        {item.date && <p className="mt-1 text-xs text-muted">{item.date}</p>}
        {item.description && <p className="mt-2 text-sm text-muted">{item.description}</p>}

        {status === "done" ? (
          <p className="mt-4 text-sm">You are on the list. We will email you.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email"
              className="w-full border border-line bg-surface px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="whitespace-nowrap bg-ink px-4 py-2 text-sm text-paper disabled:opacity-60"
            >
              {status === "loading" ? "Saving" : "Notify me"}
            </button>
          </form>
        )}
        {status === "error" && <p className="mt-2 text-xs text-muted">{message}</p>}
      </div>
    </div>
  );
}

export default function SneakPeek({ items, description }) {
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-content px-5 py-14 md:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl leading-tight md:text-5xl">Sneak peek</h2>
        {description && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        {items.map((item) => (
          <NotifyCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}