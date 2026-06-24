import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { ThemeToggle, useTheme } from "./theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

function ProfileDropdown({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser({ email: data.session.user.email ?? "" });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email ?? "" } : null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  if (!user) return null;

  const initial = user.email.charAt(0).toUpperCase();
  const textCls = scrolled ? "text-[#F5F0E8]" : "text-parchment";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-9 h-9 rounded-full border border-steel flex items-center justify-center text-sm font-semibold transition-colors hover:border-brass ${scrolled ? "bg-[rgba(255,255,255,0.1)] text-[#F5F0E8]" : "bg-iron text-parchment"}`}
        aria-label="Profile menu"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-surface border border-steel rounded shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-steel">
            <p className="text-[10px] uppercase tracking-widest text-ivory">Signed in as</p>
            <p className="text-sm text-parchment truncate mt-0.5">{user.email}</p>
          </div>
          <div className="py-1">
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-parchment hover:bg-iron hover:text-brass transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Admin Panel
            </Link>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-iron transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textCls = scrolled ? "text-[#F5F0E8]" : "text-parchment";
  const subTextCls = scrolled ? "text-[#C8C0B0]" : "text-ivory";

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
          <span className={`font-display text-2xl tracking-tight ${textCls}`}>SproutIt</span>
          <span className={`text-[10px] uppercase tracking-[0.22em] mt-1 ${subTextCls}`}>
            Design &amp; Fabrication
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-9">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`text-sm transition-colors hover:text-brass ${textCls}`}
              activeProps={{ className: "text-brass" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          <ThemeToggle />
          <ProfileDropdown scrolled={scrolled} />
        </nav>
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <ProfileDropdown scrolled={scrolled} />
          <button
            className={`text-xl ${textCls}`}
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