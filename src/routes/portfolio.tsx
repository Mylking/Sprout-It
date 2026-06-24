import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchPublishedProducts, primaryImage } from "@/lib/sproutit";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — SproutIt Design" },
      { name: "description", content: "Selected work from the SproutIt Design studio." },
      { property: "og:title", content: "Portfolio — SproutIt Design" },
      { property: "og:description", content: "Selected fabrication and prototyping work." },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { data: products } = useQuery({ queryKey: ["products-portfolio"], queryFn: () => fetchPublishedProducts() });

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="mb-14 max-w-2xl">
          <div className="eyebrow mb-3">Selected Work</div>
          <h1 className="font-display text-5xl text-parchment">Portfolio</h1>
          <p className="mt-4 text-ivory">Proof we did this.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(products ?? []).map((p) => (
            <Link key={p.id} to="/products/$slug" params={{ slug: p.slug }} className="group relative aspect-[4/5] overflow-hidden bg-iron border border-steel">
              {primaryImage(p) ? (
                <img src={primaryImage(p)!} alt={p.title} className="w-full h-full object-cover img-warm group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ivory uppercase tracking-widest text-xs">No image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="eyebrow mb-1">{p.category?.name ?? "Project"}</div>
                <h3 className="font-display text-xl text-parchment">{p.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
