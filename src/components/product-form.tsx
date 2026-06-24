import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchCategories, slugify } from "@/lib/sproutit";
import { toast } from "sonner";

type ProductRow = {
  id?: string;
  title: string;
  slug: string;
  category_id: string | null;
  short_description: string;
  full_description: string;
  material: string;
  process: string;
  use_case: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
};

type ImageRow = {
  id: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
};

const empty: ProductRow = {
  title: "", slug: "", category_id: null, short_description: "", full_description: "",
  material: "", process: "", use_case: "", is_featured: false, is_published: false, display_order: 0,
};

export function ProductForm({ productId }: { productId?: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductRow>(empty);
  const [savedId, setSavedId] = useState<string | null>(productId ?? null);
  const [loaded, setLoaded] = useState(!productId);
  const fileInput = useRef<HTMLInputElement>(null);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: images, refetch: refetchImages } = useQuery({
    queryKey: ["product-images", savedId],
    queryFn: async () => {
      if (!savedId) return [];
      const { data } = await supabase.from("product_images").select("*").eq("product_id", savedId).order("display_order");
      return (data ?? []) as ImageRow[];
    },
    enabled: !!savedId,
  });

  useEffect(() => {
    if (!productId) return;
    (async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
      if (error || !data) { toast.error("Could not load product"); return; }
      setForm({
        title: data.title, slug: data.slug, category_id: data.category_id,
        short_description: data.short_description ?? "", full_description: data.full_description ?? "",
        material: data.material ?? "", process: data.process ?? "", use_case: data.use_case ?? "",
        is_featured: data.is_featured, is_published: data.is_published, display_order: data.display_order,
      });
      setLoaded(true);
    })();
  }, [productId]);

  const save = async (publish?: boolean) => {
    if (!form.title.trim()) return toast.error("Title required");
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      is_published: publish ?? form.is_published,
    };
    if (savedId) {
      const { error } = await supabase.from("products").update(payload).eq("id", savedId);
      if (error) return toast.error(error.message);
      toast.success("Saved");
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) return toast.error(error.message);
      setSavedId(data.id);
      toast.success(publish ? "Created & published" : "Saved as draft");
      navigate({ to: "/admin/products/$id/edit", params: { id: data.id }, replace: true });
    }
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const upload = async (files: FileList | null) => {
    if (!files || !savedId) {
      if (!savedId) toast.error("Save the product first, then upload images");
      return;
    }
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} > 10MB`); continue; }
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${savedId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file);
      if (upErr) { toast.error(upErr.message); continue; }
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      const isFirst = (images?.length ?? 0) === 0;
      const { error: insErr } = await supabase.from("product_images").insert({
        product_id: savedId, storage_path: path, public_url: pub.publicUrl,
        alt_text: form.title, is_primary: isFirst, display_order: (images?.length ?? 0),
      });
      if (insErr) toast.error(insErr.message);
    }
    refetchImages();
    if (fileInput.current) fileInput.current.value = "";
  };

  const setPrimary = async (id: string) => {
    if (!savedId) return;
    await supabase.from("product_images").update({ is_primary: false }).eq("product_id", savedId);
    await supabase.from("product_images").update({ is_primary: true }).eq("id", id);
    refetchImages();
  };
  const delImage = async (img: ImageRow) => {
    if (!confirm("Delete this image?")) return;
    await supabase.storage.from("product-images").remove([img.storage_path]);
    await supabase.from("product_images").delete().eq("id", img.id);
    refetchImages();
  };

  const inputCls = "w-full bg-background border border-steel rounded px-3 py-2 text-sm text-parchment focus:border-brass outline-none";
  if (!loaded) return <div className="text-ivory">Loading…</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-parchment">{savedId ? "Edit Product" : "New Product"}</h1>
        <div className="flex gap-3">
          <button onClick={() => save(false)} className="btn-ghost">Save Draft</button>
          <button onClick={() => save(true)} className="btn-primary">Publish</button>
        </div>
      </header>

      <div className="card-industrial p-6 grid sm:grid-cols-2 gap-5">
        <label className="block sm:col-span-2">
          <span className="block text-xs uppercase tracking-widest text-ivory mb-1">Title *</span>
          <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-xs uppercase tracking-widest text-ivory mb-1">Slug</span>
          <input className={inputCls} value={form.slug} placeholder={slugify(form.title)} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-xs uppercase tracking-widest text-ivory mb-1">Category</span>
          <select className={inputCls} value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}>
            <option value="">— None —</option>
            {(categories ?? []).map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="flex items-center justify-between text-xs uppercase tracking-widest text-ivory mb-1">
            <span>Short Description (max 160)</span>
            <span>{form.short_description.length}/160</span>
          </span>
          <textarea maxLength={160} rows={2} className={inputCls} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-xs uppercase tracking-widest text-ivory mb-1">Full Description (Markdown supported)</span>
          <textarea rows={8} className={`${inputCls} font-mono text-xs`} value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} />
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-widest text-ivory mb-1">Material</span>
          <input className={inputCls} value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-widest text-ivory mb-1">Process</span>
          <input className={inputCls} value={form.process} onChange={(e) => setForm({ ...form, process: e.target.value })} />
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-widest text-ivory mb-1">Use Case</span>
          <input className={inputCls} value={form.use_case} onChange={(e) => setForm({ ...form, use_case: e.target.value })} />
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-widest text-ivory mb-1">Display Order</span>
          <input type="number" className={inputCls} value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
        </label>
        <label className="flex items-center gap-3 text-sm text-parchment">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-brass" />
          Featured
        </label>
        <label className="flex items-center gap-3 text-sm text-parchment">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="accent-brass" />
          Published
        </label>
      </div>

      <div className="card-industrial p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-parchment">Images</h2>
          <input ref={fileInput} type="file" multiple accept="image/*" onChange={(e) => upload(e.target.files)} className="text-xs text-ivory" />
        </div>
        {!savedId && <p className="text-xs text-ivory">Save the product first to upload images.</p>}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {(images ?? []).map((img) => (
            <div key={img.id} className="relative aspect-square border border-steel rounded overflow-hidden bg-iron group">
              <img src={img.public_url} alt="" className="w-full h-full object-cover" />
              {img.is_primary && <span className="absolute top-1 left-1 text-brass text-lg">★</span>}
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.is_primary && <button onClick={() => setPrimary(img.id)} title="Set primary" className="text-brass text-xs uppercase">Primary</button>}
                <button onClick={() => delImage(img)} className="text-destructive text-xs uppercase">×</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
