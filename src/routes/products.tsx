import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { fetchCategories, fetchPublishedProducts, primaryImage } from "@/lib/sproutit";

const searchSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Products & Capabilities — SproutIt Design" },
      { name: "description", content: "Browse our catalog of industrial prototypes, custom 3D printed parts, and bespoke fabrications." },
      { property: "og:title", content: "Products & Capabilities — SproutIt Design" },
      { property: "og:description", content: "Industrial prototypes, custom parts, bespoke fabrications." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search.category ?? null, search.q ?? null],
    queryFn: () => fetchPublishedProducts({ categorySlug: search.category, q: search.q }),
  });

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="mb-12">
          <div className="eyebrow mb-3">The Catalog</div>
          <h1 className="font-display text-5xl text-parchment">Products & Capabilities</h1>
          <p className="mt-4 text-ivory max-w-2xl">
            Pieces we've built, refined, and shipped. Pick a category, search by name, or just scroll.
          </p>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-10">
          <aside className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ search: (s: any) => ({ ...s, q: q || undefined }) });
              }}
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="w-full bg-iron border border-steel rounded px-3 py-2 text-sm text-parchment placeholder:text-ivory focus:border-brass outline-none"
              />
            </form>
            <div>
              <div className="eyebrow mb-3">Categories</div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => navigate({ search: (s: any) => ({ ...s, category: undefined }) })}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      !search.category ? "bg-brass text-background" : "text-parchment hover:bg-iron"
                    }`}
                  >
                    All
                  </button>
                </li>
                {(categories ?? []).map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => navigate({ search: (s: any) => ({ ...s, category: c.slug }) })}
                      className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                        search.category === c.slug ? "bg-brass text-background" : "text-parchment hover:bg-iron"
                      }`}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div>
            {isLoading ? (
              <div className="text-ivory">Loading…</div>
            ) : (products?.length ?? 0) === 0 ? (
              <div className="text-center py-24 border border-dashed border-steel rounded">
                <div className="eyebrow mb-3">Empty Workbench</div>
                <p className="text-ivory">
                  Nothing here yet — but we're always building.{" "}
                  <Link to="/contact" className="text-brass underline underline-offset-4">Get in touch</Link>.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products!.map((p) => (
                  <Link
                    key={p.id}
                    to="/products/$slug"
                    params={{ slug: p.slug }}
                    className="group card-industrial overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-iron">
                      {primaryImage(p) ? (
                        <img src={primaryImage(p)!} alt={p.title} className="w-full h-full object-cover img-warm group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ivory text-xs uppercase tracking-widest">No image</div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="eyebrow mb-2">{p.category?.name ?? "Project"}</div>
                      <h3 className="font-display text-xl text-parchment group-hover:text-brass transition-colors">{p.title}</h3>
                      <p className="mt-2 text-sm text-ivory line-clamp-2 flex-1">{p.short_description}</p>
                      <span className="mt-4 text-sm text-brass">View Details →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
