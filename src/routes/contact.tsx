import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/sproutit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const searchSchema = z.object({ product: z.string().optional() });

export const Route = createFileRoute("/contact")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Contact — SproutIt Design" },
      { name: "description", content: "Get in touch with SproutIt Design to start a project, request a quote, or just say hello." },
      { property: "og:title", content: "Contact SproutIt Design" },
      { property: "og:description", content: "Ready to build something extraordinary?" },
    ],
  }),
  component: ContactPage,
});

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  service_interest: z.string().max(120).optional().or(z.literal("")),
  product_interest: z.string().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a bit more").max(2000),
});
type InquiryForm = z.infer<typeof inquirySchema>;

const inputCls = "w-full bg-background border border-steel rounded px-3 py-2.5 text-sm text-parchment placeholder:text-ivory focus:border-brass focus:outline-none";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-ivory mb-2">{label}</span>
      {children}
      {error && <span className="block mt-1 text-xs text-destructive">{error}</span>}
    </label>
  );
}

function ContactPage() {
  const search = Route.useSearch();
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { product_interest: search.product ?? "" },
  });

  const onSubmit = async (values: InquiryForm) => {
    const message = values.product_interest
      ? `[Product of interest: ${values.product_interest}]\n\n${values.message}`
      : values.message;
    const { error } = await supabase.from("inquiries").insert({
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      service_interest: values.service_interest || null,
      message,
    });
    if (error) {
      toast.error("Could not send. Please try again or email us directly.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16">
        <div>
          <div className="eyebrow mb-3">Get in Touch</div>
          <h1 className="font-display text-5xl text-parchment leading-tight">Ready to build something extraordinary?</h1>
          <p className="mt-6 text-ivory leading-relaxed">Drop us a message with your sketches, CAD files, or just a rough idea. We'll engineer the solution together.</p>
          <div className="mt-10 space-y-3">
            <a href="mailto:sproutit.design@gmail.com" className="block text-brass hover:text-brass-hover">sproutit.design@gmail.com</a>
            <div className="text-ivory text-sm">Chennai, India</div>
          </div>
        </div>
        <div className="card-industrial p-8">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto rounded-full border-2 border-brass flex items-center justify-center text-brass text-2xl">✓</div>
              <h3 className="font-display text-2xl text-parchment mt-6">Inquiry received.</h3>
              <p className="mt-3 text-ivory">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Field label="Name *" error={errors.name?.message}><input {...register("name")} className={inputCls} /></Field>
              <Field label="Email *" error={errors.email?.message}><input type="email" {...register("email")} className={inputCls} /></Field>
              <Field label="Phone" error={errors.phone?.message}><input {...register("phone")} className={inputCls} /></Field>
              <Field label="Service of Interest" error={errors.service_interest?.message}>
                <select {...register("service_interest")} className={inputCls}>
                  <option value="">General Inquiry</option>
                  {(categories ?? []).map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
                </select>
              </Field>
              <Field label="Product of Interest" error={errors.product_interest?.message}><input {...register("product_interest")} className={inputCls} /></Field>
              <Field label="Message *" error={errors.message?.message}><textarea rows={5} {...register("message")} className={inputCls} /></Field>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">{isSubmitting ? "Sending…" : "Send Inquiry"}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
