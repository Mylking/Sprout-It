import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { ThemeToggle } from "@/components/theme-provider";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Sign In — SproutIt Design" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const onGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(result.error.message ?? "Google sign-in failed");
      if (result.redirected) return;
      toast.success("Signed in");
      navigate({ to: "/" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully!");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
        setMode("signin");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-background border border-steel rounded px-3 py-2.5 text-sm text-parchment focus:border-brass outline-none";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="absolute top-6 right-6"><ThemeToggle /></div>
      <div className="w-full max-w-md card-industrial p-8">
        <h1 className="font-display text-3xl text-parchment text-center">SproutIt Login</h1>
        <p className="text-center text-ivory text-sm mt-2">
          {mode === "signin" ? "Sign in to manage products." : "Create your account."}
        </p>
        <button
          type="button"
          onClick={onGoogle}
          disabled={googleLoading}
          className="mt-6 w-full inline-flex items-center justify-center gap-3 border border-steel rounded px-4 py-2.5 text-sm text-parchment hover:bg-iron hover:border-brass transition-colors disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 7 29.2 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 43c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.4 2.2-7.1 2.2-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 38.6 16.2 43 24 43z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.1 5c-.4.4 6.6-4.8 6.6-14.5 0-1.2-.1-2.3-.2-3.5z"/></svg>
          {googleLoading ? "Opening Google…" : "Continue with Google"}
        </button>
        <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-ivory">
          <div className="flex-1 h-px bg-steel" /> or <div className="flex-1 h-px bg-steel" />
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" className={inputCls} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Password" className={inputCls} />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>
        <button
          onClick={() => { setMode((m) => (m === "signin" ? "signup" : "signin")); setEmail(""); setPassword(""); }}
          className="block mx-auto mt-6 text-xs text-ivory hover:text-brass uppercase tracking-widest"
        >
          {mode === "signin" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}