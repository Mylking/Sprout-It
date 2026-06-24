import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: InquiriesAdmin,
});

type Inquiry = {
  id: string; name: string; email: string; phone: string | null;
  service_interest: string | null; product_id: string | null; message: string;
  status: string; created_at: string;
};

function InquiriesAdmin() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const { data: items } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Inquiry[];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setSelected(null);
    qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
  };

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-parchment">Inquiries</h1>

      <div className="card-industrial overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-steel">
            <tr className="text-left text-ivory">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-ivory">No inquiries yet.</td></tr>
            ) : items!.map((i) => (
              <tr key={i.id} className="border-b border-steel last:border-0 cursor-pointer hover:bg-iron" onClick={() => { setSelected(i); if (i.status === "new") updateStatus(i.id, "read"); }}>
                <td className="px-4 py-3 text-parchment">{i.name}</td>
                <td className="px-4 py-3 text-ivory">{i.email}</td>
                <td className="px-4 py-3 text-ivory">{i.service_interest ?? "General"}</td>
                <td className="px-4 py-3 text-ivory">{new Date(i.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-widest ${
                    i.status === "new" ? "bg-brass text-background" : i.status === "replied" ? "bg-[#27AE60] text-background" : "bg-iron text-ivory"
                  }`}>{i.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center px-6 z-50" onClick={() => setSelected(null)}>
          <div className="card-industrial p-8 max-w-2xl w-full bg-surface" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="eyebrow mb-1">Inquiry</div>
                <h2 className="font-display text-2xl text-parchment">{selected.name}</h2>
                <div className="text-ivory text-sm mt-1">{selected.email}{selected.phone && ` · ${selected.phone}`}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-ivory text-xl">✕</button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><span className="eyebrow block mb-1">Service</span><span className="text-parchment">{selected.service_interest ?? "General"}</span></div>
              <div><span className="eyebrow block mb-1">Date</span><span className="text-parchment">{new Date(selected.created_at).toLocaleString()}</span></div>
            </div>
            <div className="mt-6">
              <span className="eyebrow block mb-2">Message</span>
              <div className="text-parchment whitespace-pre-wrap leading-relaxed border border-steel rounded p-4 bg-background">{selected.message}</div>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <label className="text-xs uppercase tracking-widest text-ivory">Status</label>
              <select value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value)} className="bg-background border border-steel rounded px-3 py-2 text-sm text-parchment">
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
              <a href={`mailto:${selected.email}`} className="btn-primary ml-auto">Reply via Email</a>
              <button onClick={() => del(selected.id)} className="text-destructive text-xs uppercase tracking-widest">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
