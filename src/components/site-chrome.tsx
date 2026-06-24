import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { ThemeToggle, useTheme } from "./theme-provider";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled
          ? "bg-[rgba(28,28,30,0.92)] backdrop-blur-md border-b border-steel"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-display text-2xl text-parchment tracking-tight">SproutIt</span>
          <span className="text-[10px] uppercase tracking-[0.22em] text-ivory mt-1">
            Design &amp; Fabrication
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-9">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-parchment hover:text-brass transition-colors"
              activeProps={{ className: "text-brass" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="text-parchment text-xl"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-background border-t border-steel">
          <div className="flex flex-col px-6 py-4 gap-4">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-parchment py-2 border-l-2 border-transparent pl-3 hover:border-brass hover:text-brass"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#111113] border-t border-steel mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-3 gap-12">
        <div>
          <div className="font-display text-2xl text-parchment">SproutIt</div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-ivory mt-1">
            Design &amp; Fabrication
          </div>
          <p className="mt-4 text-sm text-ivory max-w-xs leading-relaxed">
            Industrial prototyping and bespoke manufacturing studio based in Chennai, India.
          </p>
        </div>
        <div>
          <div className="eyebrow mb-4">Navigate</div>
          <ul className="space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="text-parchment hover:text-brass transition-colors">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-4">Contact</div>
          <a
            href="mailto:sproutit.design@gmail.com"
            className="text-sm text-parchment hover:text-brass"
          >
            sproutit.design@gmail.com
          </a>
          <p className="text-sm text-ivory mt-2">Chennai, India</p>
        </div>
      </div>
      <div className="border-t border-steel">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 text-xs text-ivory">
          © {new Date().getFullYear()} SproutIt Design. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isChrome = !pathname.startsWith("/admin") && !pathname.startsWith("/auth");
  const { theme } = useTheme();
  return (
    <>
      {isChrome && <Navbar />}
      <main className={isChrome ? "pt-0" : ""}>{children}</main>
      {isChrome && <Footer />}
      <Toaster theme={theme} position="top-right" richColors />
    </>
  );
}
