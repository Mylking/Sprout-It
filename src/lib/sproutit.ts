import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  short_description: string | null;
  full_description: string | null;
  material: string | null;
  process: string | null;
  use_case: string | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
};

export type ProductWithImages = Product & {
  category: Category | null;
  images: ProductImage[];
};

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");
  if (error) throw error;
  return data ?? [];
}

export async function fetchPublishedProducts(opts?: {
  categorySlug?: string;
  featured?: boolean;
  q?: string;
}): Promise<ProductWithImages[]> {
  let query = supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*)")
    .eq("is_published", true)
    .order("display_order");
  if (opts?.featured) query = query.eq("is_featured", true);
  if (opts?.q) {
    query = query.or(
      `title.ilike.%${opts.q}%,short_description.ilike.%${opts.q}%`,
    );
  }
  const { data, error } = await query;
  if (error) throw error;
  let rows = (data ?? []) as unknown as ProductWithImages[];
  if (opts?.categorySlug) {
    rows = rows.filter((r) => r.category?.slug === opts.categorySlug);
  }
  // sort images per product
  rows.forEach((r) => {
    r.images = (r.images ?? []).sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.display_order - b.display_order;
    });
  });
  return rows;
}

export async function fetchProductBySlug(slug: string): Promise<ProductWithImages | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as ProductWithImages;
  row.images = (row.images ?? []).sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.display_order - b.display_order;
  });
  return row;
}

export function primaryImage(p: ProductWithImages): string | null {
  return p.images[0]?.public_url ?? null;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
