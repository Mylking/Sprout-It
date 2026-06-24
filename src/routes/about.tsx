import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — SproutIt Design" },
      { name: "description", content: "SproutIt Design is a Chennai-based industrial prototyping and bespoke manufacturing studio." },
      { property: "og:title", content: "About SproutIt Design" },
      { property: "og:description", content: "Where old-world craftsmanship meets cutting-edge fabrication." },
    ],
  }),
  component: AboutPage,
});

const process = [
  { n: "01", title: "The Spark", desc: "We meet your idea where it lives — sketch, prototype, or spreadsheet." },
  { n: "02", title: "The Draft", desc: "CAD, simulation, and engineering review before a single chip is cut." },
  { n: "03", title: "The Forge", desc: "Fabrication across 3D printing, CNC, and hand-finishing." },
  { n: "04", title: "The Polish", desc: "QA, documentation, and a part you can hold in your hand." },
];

function AboutPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <div className="eyebrow mb-3">The SproutIt Blueprint</div>
        <h1 className="font-display text-5xl md:text-6xl text-parchment leading-tight">Every great innovation begins with a question.</h1>
        <div className="mt-8 text-ivory text-lg leading-relaxed space-y-5 max-w-3xl">
          <p>SproutIt Design is where old-world craftsmanship and cutting-edge fabrication meet. We're a small studio in Chennai building functional prototypes, precision parts, and one-of-a-kind objects for engineers, designers, and people with a clear idea — or just a sketch on a napkin.</p>
          <p>Our process pairs CAD, simulation, and stress analysis with hand-finishing and a stubborn refusal to ship anything we wouldn't be proud to hold ourselves.</p>
        </div>
        <h2 className="font-display text-3xl text-parchment mt-20 mb-8">Our Process</h2>
        <ol className="relative border-l border-steel pl-8 space-y-10">
          {process.map((s) => (
            <li key={s.n} className="relative">
              <span className="absolute -left-[42px] flex items-center justify-center w-8 h-8 rounded-full bg-brass text-background text-xs font-semibold">{s.n}</span>
              <h3 className="font-display text-2xl text-parchment">{s.title}</h3>
              <p className="mt-2 text-ivory">{s.desc}</p>
            </li>
          ))}
        </ol>
        <div className="mt-20 card-industrial p-8 bg-surface">
          <div className="eyebrow mb-2">Have an idea?</div>
          <h3 className="font-display text-3xl text-parchment mb-4">Let's build it together.</h3>
          <Link to="/contact" className="btn-primary">Start a Project</Link>
        </div>
      </div>
    </div>
  );
}
