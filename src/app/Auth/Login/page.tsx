"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Fingerprint, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSignedInProfile, signIn } from "@/services/auth";

export default function Login() {
    const shouldReduceMotion = useReducedMotion();
    const reveal = { initial: shouldReduceMotion ? false : { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.48, ease: "easeOut" as const } };

    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setError(null);
        setIsSubmitting(true);
        try {
            const { data, error } = await signIn(email, password);
            if (error) throw error;
            const profile = await getSignedInProfile();
            router.push(profile?.role === "employee" ? "/Employee/Dashboard" : "/Admin/Dashboard");

        } catch (error) {
            setError(error instanceof Error ? error.message : "Login Failed");
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <main className="relative min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(52,211,153,0.08),transparent_36%),radial-gradient(circle_at_80%_24%,rgba(20,184,166,0.12),transparent_26%)]" aria-hidden />
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(63,63,70,0.32)_1px,transparent_1px),linear-gradient(90deg,rgba(63,63,70,0.28)_1px,transparent_1px)] [background-size:48px_48px]" aria-hidden />
      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl min-w-0 items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-12">
        <motion.section className="hidden min-w-0 lg:col-span-7 lg:block" {...reveal}>
          <div className="max-w-2xl min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-[var(--surface-subtle)] px-3 py-1.5 text-sm font-medium text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Secure operations console
            </p>
            <h1 className="mt-7 text-5xl font-semibold leading-tight tracking-[-0.035em] text-zinc-50">
              Sign in to your live workforce presence layer.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
              Review site activity, verification signals, and attendance anomalies from one quiet command surface.
            </p>
          </div>
        </motion.section>

        <motion.section className="mx-auto w-full max-w-md min-w-0 lg:col-span-5" {...reveal} transition={{ duration: 0.48, delay: 0.08, ease: "easeOut" }}>
          <div className="min-w-0 rounded-xl border border-border bg-card p-6 sm:p-8">
            <div className="mb-8">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-emerald-300/10 text-emerald-200">
                <Fingerprint className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-semibold tracking-[-0.025em] text-zinc-50">Welcome back</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Use your Viso workspace credentials to continue.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-200">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={email} onChange = {(e) => setEmail(e.target.value)} className="h-12 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" placeholder="you@company.com" type="email" />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-200">Password</span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={password} onChange = {(e) => setPassword(e.target.value)} className="h-12 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" placeholder="Enter password" type="password" />
                </span>
              </label>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input className="h-4 w-4 rounded border-border bg-background accent-emerald-300" type="checkbox" />
                  Remember me
                </label>
                <a className="font-medium text-emerald-200 hover:text-emerald-100" href="#">Forgot password?</a>
              </div>
              <motion.button type="submit" disabled={isSubmitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60" whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
                {isSubmitting ? "Signing in..." : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </form>
            {error && <p className="mt-4 break-words rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-center text-sm text-red-200">{error}</p>}
            <p className="mt-7 text-center text-sm text-muted-foreground">
              New to Viso? <Link className="font-medium text-emerald-200 hover:text-emerald-100" href="/Auth/Regist">Create workspace</Link>
            </p>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Invited employee? <Link className="font-medium text-emerald-200 hover:text-emerald-100" href="/Auth/Employee">Activate account</Link>
            </p>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
