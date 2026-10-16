"use client";

import { useEffect, useRef, useState } from "react";

function CountUp({ target, duration = 1800 }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();

        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(target * eased));
          if (progress < 1) frame = requestAnimationFrame(step);
        }

        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return <span ref={ref}>{value.toLocaleString("en-NG")}</span>;
}

export default function FunFacts({ facts }) {
  const valid = facts.filter((fact) => fact.label);
  if (!valid.length) return null;

  return (
    <section className="bg-surface px-5 py-14 md:px-8">
      <div className="mx-auto flex max-w-content flex-wrap justify-center gap-x-16 gap-y-10 text-center">
        {valid.map((fact) => (
          <div key={fact.id} className="w-full sm:w-auto sm:min-w-[11rem]">
            <p className="text-4xl md:text-5xl">
              <CountUp target={Number(fact.number) || 0} />
              {fact.suffix}
            </p>
            <p className="mx-auto mt-2 max-w-[16rem] text-sm text-muted">{fact.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}