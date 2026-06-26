"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, LockKeyhole, Mail, User } from "lucide-react";
import Link from "next/link";

export default function Regist() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-5 py-6 text-foreground">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(52,211,153,0.08),transparent_36%),radial-gradient(circle_at_80%_24%,rgba(20,184,166,0.12),transparent_26%)]" aria-hidden />
      <motion.section className="relative w-full max-w-md rounded-xl border border-border bg-card p-4 sm:p-5" initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.48, ease: "easeOut" as const }}>
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-zinc-50">Create workspace</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Start a Viso workspace for your operations team.</p>
        <form className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Full name</span>
            <span className="relative block">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" placeholder="Your name" type="text" />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Work email</span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" placeholder="you@company.com" type="email" />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Company</span>
            <span className="relative block">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" placeholder="Company name" type="text" />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Password</span>
            <span className="relative block">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" placeholder="Create password" type="password" />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Confirm password</span>
            <span className="relative block">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" placeholder="Repeat password" type="password" />
            </span>
          </label>
          <motion.button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:bg-emerald-300" type="button" whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
            Create account
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account? <Link className="font-medium text-emerald-200 hover:text-emerald-100" href="/Auth/Login">Sign in</Link>
        </p>
      </motion.section>
    </main>
  );
}
