import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { fetchPublishedProducts, primaryImage } from "@/lib/sproutit";
import { Settings, Box, Gift, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SproutIt Design — Crafting Tomorrow. Honoring the Past." },
      { name: "description", content: "Industrial prototyping, precision 3D printing, and bespoke manufacturing studio in Chennai, India." },
      { property: "og:title", content: "SproutIt Design" },
      { property: "og:description", content: "From abstract ideas to tangible solutions." },
    ],
  }),
  component: Index,
});

const services = [
  { icon: Settings, title: "Industrial Prototyping", desc: "Functional prototypes for real-world testing.", slug: "industrial-prototyping" },
  { icon: Box, title: "Precision Parts & 3D Printing", desc: "High-accuracy parts in metal, polymer, and resin.", slug: "3d-printing" },
  { icon: Gift, title: "Bespoke Gifts & Souvenirs", desc: "Custom-crafted pieces with a story.", slug: "bespoke-gifts" },
  { icon: Lightbulb, title: "Idea-to-Design Consulting", desc: "From sketch to manufacture-ready CAD.", slug: "consulting" },
];

const process = [
  { n: "01", title: "The Spark", desc: "We meet your idea where it lives — sketch, prototype, or spreadsheet." },
  { n: "02", title: "The Draft", desc: "CAD, simulation, and engineering review before a single chip is cut." },
  { n: "03", title: "The Forge", desc: "Fabrication across 3D printing, CNC, and hand-finishing." },
  { n: "04", title: "The Polish", desc: "QA, documentation, and a part you can hold in your hand." },
];

function Index() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/auth", replace: true });
      } else {
        setChecked(true);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/auth", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => fetchPublishedProducts({ featured: true }),
    enabled: checked,
  });

  if (!checked) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen blueprint-bg overflow-hidden flex items-center pt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="eyebrow mb-6">Precision Manufacturing · Chennai, India</div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] text-parchment">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="block"
              >
                Crafting Tomorrow.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="block text-brass"
              >
                Honoring the Past.
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 text-lg text-ivory max-w-lg leading-relaxed"
            >
              From abstract ideas to tangible solutions. Your premier industrial prototyping and
              bespoke manufacturing partner.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link to="/products" className="btn-primary">Explore Our Work</Link>
              <Link to="/contact" className="btn-ghost">Start a Project</Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[4/5] rounded-md overflow-hidden border border-steel card-industrial">
              <img
                src="https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=900&q=80"
                alt="Industrial 3D printer at work"
                className="w-full h-full object-cover img-warm"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="eyebrow">Forge No. 03</div>
                <div className="font-display text-xl text-parchment mt-1">In the Workshop</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SERVICES STRIP */}
      <section className="bg-surface border-y border-steel py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-steel">
            {services.map((s) => (
              <Link
                key={s.slug}
                to="/products"
                search={{ category: s.slug } as never}
                className="group bg-surface p-8 hover:bg-iron transition-colors"
              >
                <s.icon className="w-8 h-8 text-brass mb-5" strokeWidth={1.4} />
                <h3 className="font-display text-xl text-parchment mb-2 group-hover:text-brass transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-ivory leading-relaxed">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-3">What We Build</div>
            <h2 className="font-display text-4xl md:text-5xl text-parchment">
              Our Work, In the Real World
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featured ?? []).slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to="/products/$slug"
                params={{ slug: p.slug }}
                className="group card-industrial overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden bg-iron">
                  {primaryImage(p) ? (
                    <img
                      src={primaryImage(p)!}
                      alt={p.title}
                      className="w-full h-full object-cover img-warm group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ivory text-xs uppercase tracking-widest">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="eyebrow mb-2">{p.category?.name ?? "Project"}</div>
                  <h3 className="font-display text-xl text-parchment group-hover:text-brass transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-ivory line-clamp-2 flex-1">{p.short_description}</p>
                  <span className="mt-4 text-sm text-brass">View Details →</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-14 flex justify-center">
            <Link to="/products" className="btn-ghost">View All Products</Link>
          </div>
        </div>
      </section>

      {/* ABOUT / PROCESS */}
      <section id="about" className="bg-surface border-y border-steel py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16">
          <div>
            <div className="eyebrow mb-3">The SproutIt Blueprint</div>
            <h2 className="font-display text-4xl md:text-5xl text-parchment leading-tight">
              Every great innovation begins with a question.
            </h2>
            <div className="mt-6 space-y-4 text-ivory leading-relaxed">
              <p>
                SproutIt Design is where old-world craftsmanship and cutting-edge fabrication meet.
                We're a small studio in Chennai building functional prototypes, precision parts, and
                one-of-a-kind objects for engineers, designers, and people with a clear idea — or
                just a sketch on a napkin.
              </p>
              <p>
                We treat every project like the first one: with care, curiosity, and the conviction
                that the right tools in the right hands turn ideas into things that work.
              </p>
            </div>
          </div>
          <ol className="relative border-l border-steel pl-8 space-y-10">
            {process.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <span className="absolute -left-[42px] flex items-center justify-center w-8 h-8 rounded-full bg-brass text-background text-xs font-semibold">
                  {s.n}
                </span>
                <h3 className="font-display text-2xl text-parchment">{s.title}</h3>
                <p className="mt-2 text-ivory">{s.desc}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
