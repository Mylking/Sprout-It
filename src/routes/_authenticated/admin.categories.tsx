import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, slugify } from "@/lib/sproutit";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesAdmin,
});

function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data: cats } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", display_order: 0 });

  const reset = () => { setEditing(null); setForm({ name: "", slug: "", description: "", display_order: 0 }); };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    const { error } = editing
      ? await supabase.from("categories").update(payload).eq("id", editing)
      : await supabase.from("categories").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Created");
    reset();
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const del = async (id: string) => {
    const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("category_id", id);
    if ((count ?? 0) > 0) return toast.error(`Can't delete — ${count} product(s) use this category.`);
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const inputCls = "w-full bg-background border border-steel rounded px-3 py-2 text-sm text-parchment focus:border-brass outline-none";

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="font-display text-3xl text-parchment">Categories</h1>

      <div className="card-industrial p-6 space-y-4">
        <h2 className="font-display text-lg text-parchment">{editing ? "Edit Category" : "New Category"}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-ivory mb-1">Name</span>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-ivory mb-1">Slug (auto if blank)</span>
            <input className={inputCls} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </label>
          <label className="block sm:col-span-2">
            <span className="block text-xs uppercase tracking-widest text-ivory mb-1">Description</span>
            <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-ivory mb-1">Display Order</span>
            <input type="number" className={inputCls} value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
          </label>
        </div>
        <div className="flex gap-3">
          <button onClick={save} className="btn-primary">{editing ? "Save Changes" : "Add Category"}</button>
          {editing && <button onClick={reset} className="btn-ghost">Cancel</button>}
        </div>
      </div>

      <div className="card-industrial overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-steel">
            <tr className="text-left text-ivory">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium w-32"></th>
            </tr>
          </thead>
          <tbody>
            {(cats ?? []).map((c) => (
              <tr key={c.id} className="border-b border-steel last:border-0">
                <td className="px-4 py-3 text-parchment">{c.name}</td>
                <td className="px-4 py-3 text-ivory font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3 text-ivory">{c.display_order}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => { setEditing(c.id); setForm({ name: c.name, slug: c.slug, description: c.description ?? "", display_order: c.display_order }); }} className="text-brass text-xs uppercase tracking-widest">Edit</button>
                  <button onClick={() => del(c.id)} className="text-destructive text-xs uppercase tracking-widest">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
