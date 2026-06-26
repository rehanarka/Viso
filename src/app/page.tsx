"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Code2, Crosshair, Fingerprint, Globe2, History, ShieldCheck, Webhook } from "lucide-react";
import Link from "next/link";

const bars = [40, 60, 30, 80, 45, 70, 95, 50, 20, 65, 55, 85];

const navItems = ["Home", "How it Works", "Company"];

const dashboardHeights = [58, 86, 44, 72];

const signalBars = [0, 1, 2, 3, 4];

const identityRows = [1, 2];

const chartLines = [1, 2, 3, 4, 5];

const presenceRows = [{ name: "Maya R.", team: "North Gate", time: "08:59 AM", status: "Verified" }, { name: "Arif S.", team: "Field Ops", time: "09:03 AM", status: "Geo-lock" }, { name: "Nadia P.", team: "Warehouse", time: "09:05 AM", status: "Review" }];

const trustTiles = [{ label: "Team members", value: "24" }, { label: "Records today", value: "7" }, { label: "Needs review", value: "3" }];

const footerColumns = [{ title: "Product", links: [{ label: "Face attendance", href: "#how-it-works" }, { label: "Geofence", href: "#how-it-works" }, { label: "Admin setup", href: "#company" }, { label: "Employee flow", href: "#company" }] }, { title: "Workspace", links: [{ label: "Create workspace", href: "/Auth/Regist" }, { label: "Sign in", href: "/Auth/Login" }, { label: "Employee activation", href: "/Auth/Employee" }] }];

const geofenceChecks = ["Set an office point and allowed radius from the company page.", "Reject attendance when GPS distance is outside the workspace radius.", "Keep manual attendance available for approved corrections."];

const integrationFeatures = [{ icon: Code2, title: "Admin setup", body: "Create departments, positions, shifts, and employee accounts from the admin console." }, { icon: Webhook, title: "AI service", body: "Use the separate FastAPI service for face detection, face registration, and recognition." }];

const workflowLines = ["Admin creates a workspace and office geofence.", "Departments, positions, and shifts are prepared.", "Employees activate accounts and register face samples.", "Attendance opens camera only when the employee starts presence.", "Viso checks face match and location before saving the record."];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-200">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden />
      {children}
    </p>
  );
}

function MetricCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-[var(--surface-subtle)] p-5">
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <div className={`text-xl font-semibold tracking-tight ${accent ? "text-emerald-300" : "text-zinc-50"}`}>
        {value}
      </div>
    </div>
  );
}

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, y: 22, filter: "blur(8px)" },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.55, delay, ease: "easeOut" as const },
  });

  return (
    <main className="w-full max-w-[100vw] overflow-x-hidden bg-background text-foreground">
      <nav className="fixed inset-x-0 top-0 z-50 w-full max-w-[100vw] overflow-hidden border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <a className="text-lg font-bold tracking-tight" href="#home">
            Viso
          </a>
          <div className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <a className="rounded-sm text-xs font-medium text-muted-foreground transition-colors hover:text-emerald-200"
                href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
                key={item}
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link className="hidden min-h-11 items-center rounded-lg border border-zinc-700 px-4 text-xs font-bold text-zinc-100 transition hover:bg-[var(--surface-subtle)] sm:inline-flex" href="/Auth/Login">
              Sign in
            </Link>
            <Link className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-xs font-bold text-primary-foreground transition hover:bg-emerald-300" href="/Auth/Regist">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <section id="home" className="relative w-full max-w-[100vw] scroll-mt-16 overflow-hidden border-b border-border pt-28 sm:pt-32 lg:pt-28">
        <div className="absolute inset-x-0 top-16 h-px bg-emerald-300/30" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-7xl min-w-0 gap-10 px-5 pb-14 sm:px-8 lg:grid-cols-12 lg:items-start lg:pb-16">
          <motion.div className="z-10 max-w-xl min-w-0 lg:col-span-5" {...reveal()}>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-[var(--surface-subtle)] px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden />
              <span className="text-xs font-semibold text-emerald-200">
                VISO
              </span>
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.04] tracking-[-0.03em] text-zinc-50 sm:text-6xl">
              The standard for{" "}
              <span className="text-emerald-300">workforce</span> presence.
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
              A smart attendance system for teams that need employee records, face verification, GPS checks, shifts, and manual attendance in one workspace.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
                <Link className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-center text-sm font-bold text-primary-foreground transition hover:bg-emerald-300" href="/Auth/Regist">
                  Create workspace
                </Link>
              </motion.div>
              <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
                <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-700 bg-background px-6 text-center text-sm font-semibold text-zinc-100 transition hover:bg-[var(--surface-subtle)]" href="/Auth/Login">
                  Sign in
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div className="relative min-h-[360px] min-w-0 lg:col-span-7" {...reveal(0.12)}>
            <motion.div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-xl border border-emerald-300/20 bg-card shadow-[0_0_0_1px_rgba(52,211,153,0.04)]" whileHover={shouldReduceMotion ? undefined : { y: -4, borderColor: "rgba(110,231,183,0.35)" }} transition={{ duration: 0.25 }}>
              <div className="flex h-12 items-center gap-2 border-b border-border bg-[var(--surface-panel-high)] px-5">
                <span className="h-3 w-3 rounded-full bg-red-300/25" aria-hidden />
                <span className="h-3 w-3 rounded-full bg-zinc-700" aria-hidden />
                <span className="h-3 w-3 rounded-full bg-zinc-700" aria-hidden />
                <div className="ml-auto flex gap-3">
                  <span className="h-3 w-20 rounded bg-zinc-700" aria-hidden />
                  <span className="h-3 w-12 rounded bg-emerald-400/20" aria-hidden />
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                  {trustTiles.map((tile, index) => (
                    <div className="rounded-lg border border-border bg-background/70 p-3" key={tile.label}>
                      <div className="text-xs text-muted-foreground">{tile.label}</div>
                      <motion.div className="mt-1 text-xl font-semibold text-zinc-50" initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 + index * 0.08 }}>
                        {tile.value}
                      </motion.div>
                    </div>
                  ))}
                </div>
                <div className="mb-4 flex h-28 items-end gap-3 rounded-lg border border-border bg-background/60 p-3">
                  {dashboardHeights.map((height, index) => (
                    <motion.div className="flex-1 rounded bg-emerald-400/20" key={height} initial={shouldReduceMotion ? false : { height: "18%" }} animate={{ height: `${height}%` }} transition={{ duration: 0.7, delay: 0.25 + index * 0.08, ease: "easeOut" }} style={{ opacity: index === 2 ? 0.48 : 1 }} />
                  ))}
                </div>
                <div className="space-y-2">
                  {presenceRows.map((row, index) => (
                    <motion.div className="flex items-center justify-between rounded-lg border border-border bg-[var(--surface-panel-high)] p-3" key={row.name} initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.48 + index * 0.09, duration: 0.42 }}>
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-300/10 text-[11px] font-bold text-emerald-200">{row.name.slice(0, 2).toUpperCase()}</div>
                        <div>
                          <div className="text-sm font-medium text-zinc-100">{row.name}</div>
                          <div className="text-xs text-muted-foreground">{row.team}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold ${index === 2 ? "text-zinc-400" : "text-emerald-300"}`}>{row.status}</span>
                        <div className="mt-1 text-xs text-muted-foreground">{row.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative w-full max-w-[100vw] overflow-hidden border-b border-border bg-[var(--surface-subtle)] px-5 py-24 text-center sm:px-8">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent" aria-hidden />
        <motion.div className="mx-auto max-w-4xl" {...reveal()}>
          <SectionLabel>Why it exists</SectionLabel>
          <h2 className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.025em] text-zinc-50 sm:text-5xl">
            Attendance gets messy when employee data, face checks, location rules, and manual corrections live in different places.
          </h2>
          <div className="mx-auto my-10 h-px w-20 bg-emerald-300" aria-hidden />
          <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Viso keeps the flow practical: admins prepare the workspace, employees verify presence, and every record stays traceable.
          </p>
        </motion.div>
      </section>

      <section id="how-it-works" className="relative w-full max-w-[100vw] scroll-mt-16 overflow-hidden border-b border-border py-24 sm:py-32">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(63,63,70,0.32)_1px,transparent_1px),linear-gradient(90deg,rgba(63,63,70,0.28)_1px,transparent_1px)] [background-size:48px_48px]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/70" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-7xl min-w-0 items-center gap-14 px-5 sm:px-8 lg:grid-cols-12">
          <motion.div className="min-w-0 lg:col-span-5" {...reveal()}>
            <SectionLabel>Location checks</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.025em] sm:text-5xl">
              Geofence before attendance is saved.
            </h2>
            <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground">
              Admins can set the workplace location from a map or manual coordinates. Employee presence is rejected when the detected distance is outside the allowed radius.
            </p>
            <ul className="mt-8 space-y-4">
              {geofenceChecks.map((item) => (
                <li className="flex items-start gap-3 text-sm text-zinc-200" key={item}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div className="min-w-0 lg:col-span-7" {...reveal(0.12)}>
            <div className="rounded-xl border border-emerald-300/20 bg-[var(--surface-subtle)] p-2">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-[var(--surface-panel-high)]">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0_46%,rgba(63,63,70,0.55)_46%_47%,transparent_47%_100%)]" aria-hidden />
                <motion.div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-emerald-300/12 to-transparent" aria-hidden animate={shouldReduceMotion ? undefined : { x: ["-100%", "320%"] }} transition={{ duration: 4.8, repeat: Infinity, ease: "linear" }} />
                <div className="absolute left-5 top-5 space-y-3">
                  <div className="w-48 rounded border border-zinc-700 bg-background/95 p-4">
                    <div className="mb-2 text-xs font-medium text-muted-foreground">
                      Office radius
                    </div>
                    <div className="text-2xl font-semibold text-emerald-300">
                      100m
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-700">
                        <div className="h-full w-[88%] bg-emerald-400" />
                      </div>
                      <span className="text-[11px] font-semibold">Set</span>
                    </div>
                  </div>
                  <div className="w-48 rounded border border-zinc-700 bg-background/95 p-4">
                    <div className="mb-3 text-xs font-medium text-muted-foreground">
                      GPS check
                    </div>
                    <div className="flex gap-1">
                      {signalBars.map((item) => (
                        <span className={`w-2 ${item === 4 ? "bg-zinc-700" : "bg-emerald-400"}`}
                          key={item}
                          style={{ height: `${14 + item * 3}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-5 right-5 grid h-12 w-12 place-items-center rounded-full bg-emerald-400 text-emerald-950">
                  <motion.div animate={shouldReduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                    <Crosshair className="h-5 w-5" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="w-full max-w-[100vw] overflow-hidden border-b border-border bg-[var(--surface-panel)] py-24 sm:py-32">
        <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-10 px-5 sm:px-8 lg:grid-cols-12">
          <motion.div className="min-w-0 space-y-5 lg:col-span-4 lg:self-center" {...reveal()}>
            <motion.div className="rounded-xl border border-border bg-card p-6" whileHover={shouldReduceMotion ? undefined : { y: -3, borderColor: "rgba(110,231,183,0.28)" }}>
              <div className="mb-4 flex items-center gap-3">
                <Fingerprint className="h-5 w-5 text-emerald-300" />
                <h3 className="text-2xl font-medium tracking-[-0.01em]">
                  Face layer
                </h3>
              </div>
              <p className="mb-6 text-sm leading-6 text-muted-foreground">
                Employees register multiple face samples. Attendance uses the best match and rejects unknown faces.
              </p>
              <div className="space-y-3">
                {identityRows.map((item) => (
                  <div className="flex items-center gap-3 rounded border border-border bg-[var(--surface-panel-high)] p-3" key={item}>
                    <div className="h-8 w-8 rounded bg-zinc-700" />
                    <div className="h-2 w-20 rounded bg-zinc-700" />
                    <ShieldCheck className="ml-auto h-4 w-4 text-emerald-300" />
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div className="rounded-xl border border-border bg-card/70 p-6" whileHover={shouldReduceMotion ? undefined : { y: -3 }}>
              <div className="mb-4 flex items-center gap-3 text-muted-foreground">
                <History className="h-5 w-5" />
                <h3 className="text-2xl font-medium tracking-[-0.01em]">
                  Attendance history
                </h3>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Face scans, GPS checks, and manual admin records appear in attendance history for review.
              </p>
            </motion.div>
          </motion.div>

          <motion.div className="min-w-0 lg:col-span-8" {...reveal(0.12)}>
            <div className="rounded-xl border border-border bg-card p-5 sm:p-10">
              <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Attendance activity
                  </p>
                  <h2 className="text-4xl font-semibold tracking-[-0.025em] sm:text-5xl">
                    Workspace overview
                  </h2>
                </div>
                <div className="flex gap-2">
                  <span className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold">
                    Weekly
                  </span>
                  <span className="rounded border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300">
                    Monthly
                  </span>
                </div>
              </div>
              <div className="relative flex h-72 items-end gap-2 px-1">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {chartLines.map((line) => (
                    <span className="h-px bg-zinc-800/70" key={line} />
                  ))}
                </div>
                {bars.map((height, index) => (
                  <motion.div className="relative z-10 flex-1 rounded-t bg-emerald-400/30 transition-colors hover:bg-emerald-300" key={`${height}-${index}`} initial={shouldReduceMotion ? false : { height: "8%" }} whileInView={{ height: `${height}%` }} viewport={{ once: true }} transition={{ duration: 0.72, delay: index * 0.035, ease: "easeOut" }} style={{ opacity: index === 6 ? 1 : 0.55 + height / 220 }} />
                ))}
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <MetricCard label="Face samples" value="3 per user" />
                <MetricCard label="GPS rule" value="Radius based" />
                <MetricCard accent label="Manual entry" value="Admin only" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="company" className="w-full max-w-[100vw] scroll-mt-16 overflow-hidden border-b border-border bg-background py-24 sm:py-32">
        <div className="mx-auto grid w-full max-w-7xl min-w-0 items-center gap-12 px-5 sm:px-8 lg:grid-cols-12">
          <motion.div className="min-w-0 lg:col-span-5" {...reveal()}>
            <h2 className="text-4xl font-semibold leading-tight tracking-[-0.025em] sm:text-5xl">
              Built around <br />
              <span className="font-mono text-emerald-300">daily admin flow.</span>
            </h2>
            <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground">
              Start with company setup, add departments and employees, then let employees register their face and submit attendance from their own dashboard.
            </p>
            <div className="mt-10 space-y-7">
              {integrationFeatures.map((item) => (
                <motion.div className="flex gap-4" key={item.title} whileHover={shouldReduceMotion ? undefined : { x: 4 }}>
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-zinc-800 bg-zinc-900">
                    <item.icon className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div className="min-w-0 lg:col-span-7" {...reveal(0.12)}>
            <div className="overflow-hidden rounded-xl border border-border bg-[var(--surface-panel)]">
              <div className="flex items-center gap-4 border-b border-border bg-[var(--surface-panel-high)] px-5 py-4">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-300/25" aria-hidden />
                  <span className="h-3 w-3 rounded-full bg-zinc-700" aria-hidden />
                  <span className="h-3 w-3 rounded-full bg-zinc-700" aria-hidden />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  workspace_flow.txt
                </span>
              </div>
              <div className="overflow-x-auto p-5 font-mono text-sm leading-7 sm:p-8">
                {workflowLines.map((line, index) => (
                  <motion.div className="flex min-w-[520px] gap-5 rounded px-2 transition-colors hover:bg-emerald-400/5" key={line} initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.24, delay: index * 0.025 }}>
                    <span className="select-none text-zinc-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-zinc-300">{line}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="pricing" className="relative w-full max-w-[100vw] scroll-mt-16 overflow-hidden bg-card px-5 py-24 text-center sm:px-8 sm:py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" aria-hidden />
        <motion.h2 className="mx-auto max-w-4xl text-3xl font-semibold tracking-[-0.025em] sm:text-5xl" {...reveal()}>
          Ready to set up your workspace?
        </motion.h2>
        <motion.div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row" {...reveal(0.08)}>
          <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
            <Link className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-bold text-primary-foreground transition hover:bg-emerald-300" href="/Auth/Regist">
              Create workspace
            </Link>
          </motion.div>
          <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
            <Link className="inline-flex min-h-12 items-center justify-center rounded-lg border border-zinc-700 px-8 text-sm font-semibold text-zinc-100 transition hover:bg-[var(--surface-subtle)]" href="/Auth/Login">
              Sign in
            </Link>
          </motion.div>
        </motion.div>
        <motion.p className="mt-8 text-sm text-muted-foreground" {...reveal(0.14)}>
          Create an admin workspace, then invite employees when your company data is ready.
        </motion.p>
      </section>

      <footer className="w-full max-w-[100vw] overflow-hidden border-t border-border bg-[var(--surface-subtle)] px-5 py-16 sm:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-5 text-lg font-bold">Viso</div>
              <p className="max-w-xs text-sm leading-6 text-muted-foreground">
                Smart attendance management with face verification, geofence checks, and admin controls.
              </p>
            </div>
            {footerColumns.map(({ title, links }) => (
              <div key={title}>
                <h3 className="mb-5 text-sm font-semibold text-zinc-100">
                  {title}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a className="rounded-sm text-sm text-muted-foreground transition hover:text-emerald-200"
                        href={link.href}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-14 flex flex-col gap-5 border-t border-border pt-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>2026 Viso Technologies Inc. All rights reserved.</span>
            <div className="flex gap-5">
              <Code2 className="h-4 w-4" />
              <Webhook className="h-4 w-4" />
              <Globe2 className="h-4 w-4" />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
