import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsLayout,
});

function ProductsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/admin/products") return <Outlet />;
  return <ProductsList />;
}

function ProductsList() {
  const qc = useQueryClient();
  const { data: items } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name), images:product_images(public_url, is_primary)")
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const togglePublish = async (id: string, current: boolean) => {
    const { error } = await supabase.from("products").update({ is_published: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product? Its images will also be removed.")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-parchment">Products</h1>
        <Link to="/admin/products/new" className="btn-primary">+ New Product</Link>
      </header>

      <div className="card-industrial overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-steel">
            <tr className="text-left text-ivory">
              <th className="px-4 py-3 font-medium w-20"></th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium w-40"></th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ivory">No products yet.</td></tr>
            ) : items!.map((p: any) => {
              const img = (p.images ?? []).find((i: any) => i.is_primary) ?? p.images?.[0];
              return (
                <tr key={p.id} className="border-b border-steel last:border-0">
                  <td className="px-4 py-3">
                    <div className="w-14 h-14 bg-iron border border-steel overflow-hidden rounded">
                      {img && <img src={img.public_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-parchment">
                    {p.title}
                    {p.is_featured && <span className="ml-2 text-[10px] uppercase tracking-widest text-brass">★ Featured</span>}
                  </td>
                  <td className="px-4 py-3 text-ivory">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-widest ${p.is_published ? "bg-[#27AE60] text-background" : "bg-iron text-ivory"}`}>
                      {p.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ivory">{new Date(p.updated_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link to="/admin/products/$id/edit" params={{ id: p.id }} className="text-brass text-xs uppercase tracking-widest">Edit</Link>
                    <button onClick={() => togglePublish(p.id, p.is_published)} className="text-ivory text-xs uppercase tracking-widest hover:text-brass">{p.is_published ? "Unpublish" : "Publish"}</button>
                    <button onClick={() => del(p.id)} className="text-destructive text-xs uppercase tracking-widest">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
