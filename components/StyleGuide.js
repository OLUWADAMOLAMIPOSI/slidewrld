import Image from "next/image";
import Link from "next/link";

export default function StyleGuide({ items, description }) {
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-content px-5 py-14 md:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl leading-tight md:text-5xl">Find your style</h2>
        {description && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">{description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href || "/products"}
            className="group relative block aspect-[3/4] overflow-hidden bg-ink"
          >
            {item.image && (
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-ink/35" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
              <h3 className="text-2xl">{item.title}</h3>
              <p className="mt-1 text-sm text-paper/85">{item.description}</p>
              <span className="mt-3 inline-block border-b border-paper/70 pb-0.5 text-xs">
                Shop this style
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}