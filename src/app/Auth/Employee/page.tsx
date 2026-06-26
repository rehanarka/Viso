"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { activateEmployeeAccount } from "@/services/auth";

export default function EmployeeActivation() {
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim()) {
      setError("Please enter your name and work email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await activateEmployeeAccount(email, password, fullName);
      router.push("/Employee/Dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Employee account could not be activated.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-5 py-6 text-foreground">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(52,211,153,0.08),transparent_36%),radial-gradient(circle_at_80%_24%,rgba(20,184,166,0.12),transparent_26%)]" aria-hidden />
      <motion.section className="relative w-full max-w-md rounded-xl border border-border bg-card p-5 sm:p-6" initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: "easeOut" as const }}>
        <div className="mb-5 grid size-12 place-items-center rounded-lg bg-emerald-300/10 text-emerald-200">
          <UserRound className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-zinc-50">Activate employee account</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Use the same email your admin registered in Viso, then create your login password.</p>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Full name</span>
            <span className="relative block">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" onChange={(event) => setFullName(event.target.value)} placeholder="Your name" type="text" value={fullName} />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Registered work email</span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" onChange={(event) => setEmail(event.target.value)} placeholder="employee@company.com" type="email" value={email} />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Password</span>
            <span className="relative block">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder="Create password" type="password" value={password} />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-200">Confirm password</span>
            <span className="relative block">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input className="h-10 w-full rounded-lg border border-input bg-background px-10 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300" minLength={6} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat password" type="password" value={confirmPassword} />
            </span>
          </label>

          {error && <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200" role="alert">{error}</p>}

          <motion.button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70" disabled={isSubmitting} type="submit" whileHover={shouldReduceMotion || isSubmitting ? undefined : { y: -2 }} whileTap={shouldReduceMotion || isSubmitting ? undefined : { scale: 0.98 }}>
            {isSubmitting ? "Activating..." : "Activate account"}
            <ArrowRight className="size-4" />
          </motion.button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already activated? <Link className="font-medium text-emerald-200 hover:text-emerald-100" href="/Auth/Login">Sign in</Link>
        </p>
      </motion.section>
    </main>
  );
}
