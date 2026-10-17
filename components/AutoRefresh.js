"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh({ seconds = 5, maxTries = 24 }) {
  const router = useRouter();
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (tries >= maxTries) return;
    const timer = setTimeout(() => {
      setTries((count) => count + 1);
      router.refresh();
    }, seconds * 1000);
    return () => clearTimeout(timer);
  }, [tries, maxTries, seconds, router]);

  if (tries >= maxTries) {
    return (
      <p className="mt-6 text-sm text-muted">
        This is taking longer than expected. If you were charged, please contact us with your
        payment reference. You can also reload this page to check again.
      </p>
    );
  }

  return null;
}