import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchProductBySlug } from "@/lib/sproutit";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — SproutIt Design` },
      { name: "description", content: "Product detail at SproutIt Design." },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });
  const [activeIdx, setActiveIdx] = useState(0);

  if (isLoading) return <div className="pt-32 px-6 text-ivory">Loading…</div>;
  if (!product) {
    return (
      <div className="pt-32 pb-24 min-h-screen max-w-3xl mx-auto px-6 text-center">
        <h1 className="font-display text-4xl text-parchment">Not Found</h1>
        <p className="mt-4 text-ivory">This product doesn't exist or isn't published yet.</p>
        <Link to="/products" className="btn-ghost mt-8 inline-flex">Back to Products</Link>
      </div>
    );
  }

  const main = product.images[activeIdx] ?? null;

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <nav className="text-xs text-ivory uppercase tracking-widest mb-8">
          <Link to="/" className="hover:text-brass">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-brass">Products</Link>
          {product.category && (<><span className="mx-2">/</span><span>{product.category.name}</span></>)}
          <span className="mx-2">/</span>
          <span className="text-parchment">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square overflow-hidden card-industrial bg-iron">
              {main ? (
                <img src={main.public_url} alt={main.alt_text ?? product.title} className="w-full h-full object-cover img-warm" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ivory uppercase tracking-widest text-xs">No image</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveIdx(idx)}
                    className={`shrink-0 w-20 h-20 overflow-hidden border-2 transition-colors ${
                      idx === activeIdx ? "border-brass" : "border-steel hover:border-ivory"
                    }`}
                  >
                    <img src={img.public_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.category && <div className="eyebrow mb-3">{product.category.name}</div>}
            <h1 className="font-display text-4xl md:text-5xl text-parchment">{product.title}</h1>
            <p className="mt-5 text-lg text-ivory leading-relaxed">{product.short_description}</p>

            <hr className="my-8 border-steel" />

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
              {([
                ["Material", product.material],
                ["Process", product.process],
                ["Use Case", product.use_case],
              ] as const).map(([label, val]) =>
                val ? (
                  <div key={label}>
                    <dt className="eyebrow mb-1">{label}</dt>
                    <dd className="text-parchment">{val}</dd>
                  </div>
                ) : null,
              )}
            </dl>

            {product.full_description && (
              <>
                <hr className="my-8 border-steel" />
                <div className="text-parchment leading-relaxed whitespace-pre-line">{product.full_description}</div>
              </>
            )}

            <hr className="my-8 border-steel" />
            <div className="card-industrial p-6 bg-surface">
              <div className="eyebrow mb-2">Interested in this?</div>
              <h3 className="font-display text-2xl text-parchment mb-4">Let's build your version.</h3>
              <Link to="/contact" search={{ product: product.title } as never} className="btn-primary">Inquire About This</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
