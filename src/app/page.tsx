"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Code2, Crosshair, Fingerprint, Globe2, History, ShieldCheck, Webhook } from "lucide-react";

const bars = [40, 60, 30, 80, 45, 70, 95, 50, 20, 65, 55, 85];

const navItems = ["Home", "How it Works", "Pricing", "Company"];

const dashboardHeights = [58, 86, 44, 72];

const signalBars = [0, 1, 2, 3, 4];

const identityRows = [1, 2];

const chartLines = [1, 2, 3, 4, 5];

const presenceRows = [{ name: "Maya R.", team: "North Gate", time: "08:59 AM", status: "Verified" }, { name: "Arif S.", team: "Field Ops", time: "09:03 AM", status: "Geo-lock" }, { name: "Nadia P.", team: "Warehouse", time: "09:05 AM", status: "Review" }];

const trustTiles = [{ label: "Check-ins today", value: "12,842" }, { label: "Blocked anomalies", value: "317" }, { label: "Sites online", value: "48" }];

const footerColumns = [{ title: "Product", links: [{ label: "Features", href: "#features" }, { label: "API Docs", href: "#company" }, { label: "Pricing", href: "#pricing" }, { label: "Integrations", href: "#company" }] }, { title: "Company", links: [{ label: "About", href: "#company" }, { label: "Blog", href: "#company" }, { label: "Careers", href: "#company" }, { label: "Contact", href: "#pricing" }] }, { title: "Legal", links: [{ label: "Privacy Policy", href: "#pricing" }, { label: "Terms of Service", href: "#pricing" }, { label: "Cookie Policy", href: "#pricing" }] }];

const geofenceChecks = ["3-meter precision radius via dual-band GPS.", "Instant background validation with zero battery drain.", "Offline-first sync for remote field operations."];

const integrationFeatures = [{ icon: Code2, title: "Unified SDK", body: "iOS, Android, and Web support with a single authentication flow." }, { icon: Webhook, title: "Real-time Webhooks", body: "Receive presence events as they happen with sub-50ms latency." }];

const codeLines = ["const viso = require('@viso/sdk');", "", "async function authorizeCheckIn(userId, loc) {", "  const result = await viso.validate({", "    subject: userId,", "    geofence: loc.active_zone,", "    liveness: true", "  });", "", "  return result.verified ?", "    viso.logPresence(userId) : Error('Mismatch');", "}"];

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
    <main className="min-h-screen bg-background text-foreground">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a className="text-lg font-bold tracking-tight" href="#features">
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
          <a className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-xs font-bold text-primary-foreground transition hover:bg-emerald-300" href="#pricing">
            Get Started
          </a>
        </div>
      </nav>

      <section id="home" className="relative scroll-mt-16 overflow-hidden border-b border-border pt-28 sm:pt-32 lg:pt-28">
        <div className="absolute inset-x-0 top-16 h-px bg-emerald-300/30" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-14 sm:px-8 lg:grid-cols-12 lg:items-start lg:pb-16">
          <motion.div className="z-10 max-w-xl lg:col-span-5" {...reveal()}>
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
              A high-fidelity attendance infrastructure designed for
              distributed teams, high-security facilities, and precision
              operations.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <motion.a className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-center text-sm font-bold text-primary-foreground transition hover:bg-emerald-300" href="#company" whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
                Start Integrating
              </motion.a>
              <motion.a className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-700 bg-background px-6 text-center text-sm font-semibold text-zinc-100 transition hover:bg-[var(--surface-subtle)]" href="#pricing" whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
                Book Demo
              </motion.a>
            </div>
          </motion.div>

          <motion.div className="relative min-h-[360px] lg:col-span-7" {...reveal(0.12)}>
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

      <section className="relative overflow-hidden border-b border-border bg-[var(--surface-subtle)] px-5 py-24 text-center sm:px-8">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent" aria-hidden />
        <motion.div className="mx-auto max-w-4xl" {...reveal()}>
          <SectionLabel>Operational leakage</SectionLabel>
          <h2 className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.025em] text-zinc-50 sm:text-5xl">
            Legacy attendance systems fail to capture{" "}
            <span className="text-muted-foreground">14% of labor productivity</span>{" "}
            due to buddy punching and manual logging errors.
          </h2>
          <div className="mx-auto my-10 h-px w-20 bg-emerald-300" aria-hidden />
          <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Precision in workforce data is not just about payroll. It is about
            understanding the velocity of your operations in real time.
          </p>
        </motion.div>
      </section>

      <section id="how-it-works" className="relative scroll-mt-16 overflow-hidden border-b border-border py-24 sm:py-32">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(63,63,70,0.32)_1px,transparent_1px),linear-gradient(90deg,rgba(63,63,70,0.28)_1px,transparent_1px)] [background-size:48px_48px]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/70" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-12">
          <motion.div className="lg:col-span-5" {...reveal()}>
            <SectionLabel>Spatial intelligence</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.025em] sm:text-5xl">
              Adaptive Geofencing.
            </h2>
            <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground">
              Deploy virtual perimeters that adapt to the environment. Our
              spatial engine ensures check-ins only happen where work actually
              occurs.
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
          <motion.div className="lg:col-span-7" {...reveal(0.12)}>
            <div className="rounded-xl border border-emerald-300/20 bg-[var(--surface-subtle)] p-2">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-[var(--surface-panel-high)]">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0_46%,rgba(63,63,70,0.55)_46%_47%,transparent_47%_100%)]" aria-hidden />
                <motion.div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-emerald-300/12 to-transparent" aria-hidden animate={shouldReduceMotion ? undefined : { x: ["-30%", "420%"] }} transition={{ duration: 4.8, repeat: Infinity, ease: "linear" }} />
                <div className="absolute left-5 top-5 space-y-3">
                  <div className="w-48 rounded border border-zinc-700 bg-background/95 p-4">
                    <div className="mb-2 text-xs font-medium text-muted-foreground">
                      Zone Alpha
                    </div>
                    <div className="text-2xl font-semibold text-emerald-300">
                      Active
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-700">
                        <div className="h-full w-[88%] bg-emerald-400" />
                      </div>
                      <span className="text-[11px] font-semibold">88%</span>
                    </div>
                  </div>
                  <div className="w-48 rounded border border-zinc-700 bg-background/95 p-4">
                    <div className="mb-3 text-xs font-medium text-muted-foreground">
                      Signal Strength
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

      <section className="border-b border-border bg-[var(--surface-panel)] py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-12">
          <motion.div className="space-y-5 lg:col-span-4 lg:self-center" {...reveal()}>
            <motion.div className="rounded-xl border border-border bg-card p-6" whileHover={shouldReduceMotion ? undefined : { y: -3, borderColor: "rgba(110,231,183,0.28)" }}>
              <div className="mb-4 flex items-center gap-3">
                <Fingerprint className="h-5 w-5 text-emerald-300" />
                <h3 className="text-2xl font-medium tracking-[-0.01em]">
                  Identity Layer
                </h3>
              </div>
              <p className="mb-6 text-sm leading-6 text-muted-foreground">
                Prevent identity fraud with 3D facial liveness detection that
                works in under 200ms.
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
                  Immutable Logs
                </h3>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Every action is cryptographically signed and stored on a
                tamper-proof audit trail.
              </p>
            </motion.div>
          </motion.div>

          <motion.div className="lg:col-span-8" {...reveal(0.12)}>
            <div className="rounded-xl border border-border bg-card p-5 sm:p-10">
              <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Operational Velocity
                  </p>
                  <h2 className="text-4xl font-semibold tracking-[-0.025em] sm:text-5xl">
                    System Throughput
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
                <MetricCard label="Avg. Verification" value="184ms" />
                <MetricCard label="Precision Rate" value="99.98%" />
                <MetricCard accent label="Uptime" value="SLA 100" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="company" className="scroll-mt-16 border-b border-border bg-background py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-12">
          <motion.div className="lg:col-span-5" {...reveal()}>
            <h2 className="text-4xl font-semibold leading-tight tracking-[-0.025em] sm:text-5xl">
              Built for <br />
              <span className="font-mono text-emerald-300">engineers.</span>
            </h2>
            <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground">
              Integrate Viso into your existing ERP or proprietary dashboard
              with our clean, GraphQL-based API. Built for speed, reliability,
              and security.
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
          <motion.div className="lg:col-span-7" {...reveal(0.12)}>
            <div className="overflow-hidden rounded-xl border border-border bg-[var(--surface-panel)]">
              <div className="flex items-center gap-4 border-b border-border bg-[var(--surface-panel-high)] px-5 py-4">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-300/25" aria-hidden />
                  <span className="h-3 w-3 rounded-full bg-zinc-700" aria-hidden />
                  <span className="h-3 w-3 rounded-full bg-zinc-700" aria-hidden />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  verify_presence.js
                </span>
              </div>
              <div className="overflow-x-auto p-5 font-mono text-sm leading-7 sm:p-8">
                {codeLines.map((line, index) => (
                  <motion.div className="flex min-w-[520px] gap-5 rounded px-2 transition-colors hover:bg-emerald-400/5" key={`${line}-${index}`} initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.24, delay: index * 0.025 }}>
                    <span className="select-none text-zinc-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-zinc-300">{line || "\u00a0"}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="pricing" className="relative scroll-mt-16 overflow-hidden bg-card px-5 py-24 text-center sm:px-8 sm:py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" aria-hidden />
        <motion.h2 className="mx-auto max-w-4xl text-3xl font-semibold tracking-[-0.025em] sm:text-5xl" {...reveal()}>
          Ready to modernize your operations?
        </motion.h2>
        <motion.div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row" {...reveal(0.08)}>
          <motion.a className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-bold text-primary-foreground transition hover:bg-emerald-300" href="#features" whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
            Start Free Trial
          </motion.a>
          <motion.a className="inline-flex min-h-12 items-center justify-center rounded-lg border border-zinc-700 px-8 text-sm font-semibold text-zinc-100 transition hover:bg-[var(--surface-subtle)]" href="#company" whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}>
            Talk to Sales
          </motion.a>
        </motion.div>
        <motion.p className="mt-8 text-sm text-muted-foreground" {...reveal(0.14)}>
          No credit card required. Up to 50 users free.
        </motion.p>
      </section>

      <footer className="border-t border-border bg-[var(--surface-subtle)] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-5 text-lg font-bold">Viso</div>
              <p className="max-w-xs text-sm leading-6 text-muted-foreground">
                High-precision workforce management infrastructure for modern
                distributed organizations.
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

