import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = Route.useRouteContext();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      return !!data;
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-ivory">Loading…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="card-industrial p-10 max-w-lg text-center">
          <h1 className="font-display text-3xl text-parchment">Not authorized</h1>
          <p className="mt-4 text-ivory">
            You're signed in as <span className="text-brass">{user.email}</span> but don't have admin access.
          </p>
          <p className="mt-3 text-ivory text-sm">
            Ask an existing admin to grant your account the <code className="text-brass">admin</code> role.
          </p>
          <button onClick={signOut} className="btn-ghost mt-8">Sign Out</button>
        </div>
      </div>
    );
  }

  const links = [
    { to: "/admin", label: "Dashboard", exact: true },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/categories", label: "Categories" },
    { to: "/admin/inquiries", label: "Inquiries" },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-60 min-h-screen border-r border-steel bg-surface p-6 sticky top-0">
          <div className="font-display text-xl text-parchment mb-1">SproutIt</div>
          <div className="text-[10px] uppercase tracking-widest text-ivory">Admin</div>
          <nav className="mt-10 space-y-1">
            {links.map((l) => {
              const active = ("exact" in l && l.exact) ? pathname === l.to : pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`block px-3 py-2 text-sm rounded transition-colors ${
                    active ? "bg-brass text-background" : "text-parchment hover:bg-iron"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-12 pt-6 border-t border-steel">
            <div className="text-xs text-ivory truncate">{user.email}</div>
            <button onClick={signOut} className="text-xs text-brass hover:text-brass-hover mt-2 uppercase tracking-widest">
              Sign Out
            </button>
            <Link to="/" className="block mt-3 text-xs text-ivory hover:text-brass uppercase tracking-widest">
              ← View Site
            </Link>
          </div>
        </aside>
        <div className="flex-1 p-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
