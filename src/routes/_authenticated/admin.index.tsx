import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [pubP, draftP, feat, cats, newI, allI] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("is_published", false),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("is_featured", true),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("inquiries").select("*", { count: "exact", head: true }),
      ]);
      return {
        published: pubP.count ?? 0,
        drafts: draftP.count ?? 0,
        featured: feat.count ?? 0,
        categories: cats.count ?? 0,
        newInquiries: newI.count ?? 0,
        totalInquiries: allI.count ?? 0,
      };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin-recent-inquiries"],
    queryFn: async () => {
      const { data } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const Stat = ({ label, value, sub }: { label: string; value: number; sub?: string }) => (
    <div className="card-industrial p-6">
      <div className="eyebrow">{label}</div>
      <div className="font-display text-4xl text-parchment mt-2">{value}</div>
      {sub && <div className="text-xs text-ivory mt-1">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-parchment">Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/admin/products/new" className="btn-primary">+ New Product</Link>
          <Link to="/admin/categories" className="btn-ghost">Manage Categories</Link>
        </div>
      </header>

      <div className="grid md:grid-cols-4 gap-4">
        <Stat label="Published" value={stats?.published ?? 0} sub={`${stats?.drafts ?? 0} drafts`} />
        <Stat label="Featured" value={stats?.featured ?? 0} />
        <Stat label="Categories" value={stats?.categories ?? 0} />
        <Stat label="Inquiries" value={stats?.totalInquiries ?? 0} sub={`${stats?.newInquiries ?? 0} new`} />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl text-parchment">Recent Inquiries</h2>
          <Link to="/admin/inquiries" className="text-xs text-brass uppercase tracking-widest">View All →</Link>
        </div>
        <div className="card-industrial overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-steel bg-surface">
              <tr className="text-left text-ivory">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recent ?? []).length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-ivory">No inquiries yet.</td></tr>
              ) : (
                recent!.map((i) => (
                  <tr key={i.id} className="border-b border-steel last:border-0">
                    <td className="px-4 py-3 text-parchment">{i.name}</td>
                    <td className="px-4 py-3 text-ivory">{i.email}</td>
                    <td className="px-4 py-3 text-ivory">{i.service_interest ?? "General"}</td>
                    <td className="px-4 py-3 text-ivory">{new Date(i.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-widest ${
                        i.status === "new" ? "bg-brass text-background" : i.status === "replied" ? "bg-[#27AE60] text-background" : "bg-iron text-ivory"
                      }`}>{i.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
