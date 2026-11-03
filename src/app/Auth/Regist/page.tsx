"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, LockKeyhole, Mail, User } from "lucide-react";
import Link from "next/link";
import { signUp } from "@/services/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Regist() {
    const shouldReduceMotion = useReducedMotion();
    
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [company, setCompany] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setError(null);
        if (!fullName.trim() || !email.trim() || !company.trim()) {
            setError("Isi semua data workspace dulu");
            return;
        }
        if (password.length < 6) {
            setError("Password minimal 6 karakter");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setIsSubmitting(true);
        try {
            await signUp(email, password, fullName, company);
            router.push("/Auth/Login");
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "Registrasi gagal");
        } finally {
            setIsSubmitting(false);
        }
    }
  return (
    <main className="relative grid min-h-screen w-full max-w-[100vw] place-items-center overflow-x-hidden bg-background px-5 py-6 text-foreground">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(52,211,153,0.08),transparent_36%),radial-gradient(circle_at_80%_24%,rgba(20,184,166,0.12),transparent_26%)]" aria-hidden />
      <motion.section className="relative w-full max-w-md min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5" initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.48, ease: "easeOut" as const }}>
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-zinc-50">Create workspace</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Start a Viso workspace for your operations team.</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Full name</span>
            <span className="relative block">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" placeholder="Your name" type="text" />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Work email</span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" placeholder="you@company.com" type="email" />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Company</span>
            <span className="relative block">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={company} onChange={(e) => setCompany(e.target.value)} required className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" placeholder="Company name" type="text" />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Password</span>
            <span className="relative block">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" placeholder="Create password" type="password" />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Confirm password</span>
            <span className="relative block">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" placeholder="Repeat password" type="password" />
            </span>
          </label>
          <motion.button type="submit" disabled={isSubmitting} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60" whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
            {isSubmitting ? "Creating account..." : "Create account"}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </form>
        {error && <p role="alert" className="mt-4 break-words rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p>}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account? <Link className="font-medium text-emerald-200 hover:text-emerald-100" href="/Auth/Login">Sign in</Link>
        </p>
      </motion.section>
    </main>
  );
}
