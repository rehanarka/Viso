"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, BadgeCheck, Clock3, MapPin, ShieldCheck, TrendingUp, Users } from "lucide-react";

const metrics = [
  { label: "Present today", value: "842", delta: "+12%", tone: "text-teal-200", icon: Users },
  { label: "Late check-ins", value: "18", delta: "-4%", tone: "text-amber-200", icon: Clock3 },
  { label: "Verified scans", value: "99.8%", delta: "+0.6%", tone: "text-sky-200", icon: ShieldCheck },
  { label: "Live sites", value: "48", delta: "stable", tone: "text-emerald-200", icon: Activity },
];

const rows = [
  { name: "Maya Rahman", role: "Front Office", site: "North Gate", status: "Verified", time: "08:59", tone: "text-emerald-200" },
  { name: "Arif Santoso", role: "Field Ops", site: "Project Alpha", status: "Geo-lock", time: "09:03", tone: "text-sky-200" },
  { name: "Nadia Putri", role: "Warehouse", site: "Distribution Hub", status: "Review", time: "09:05", tone: "text-amber-200" },
  { name: "Raka Pratama", role: "Security", site: "South Lobby", status: "Verified", time: "09:09", tone: "text-emerald-200" },
];

const bars = [44, 58, 51, 72, 66, 86, 78, 92, 81, 88, 74, 83];
const actions = [
  { tittle: "Add New Employee", href: "Admin/Employees/Add", icon: BadgeCheck },
  { tittle: "Register New Face", href: "Admin/Employees/Register", icon: MapPin },
  { tittle: "Create Shift", href: "Admin/Schedules/Create", icon: Clock3 },
];

export default function Dashboard() {
  const shouldReduceMotion = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.48, delay, ease: "easeOut" as const },
  });

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_0%,rgba(45,212,191,0.14),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(125,211,252,0.1),transparent_24%),#09090b] p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <motion.section className="mb-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]" {...reveal()}>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(24,24,27,0.94),rgba(13,17,19,0.92))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="absolute right-6 top-6 hidden h-24 w-24 rounded-full border border-teal-200/20 md:block" />
            <div className="relative z-10 max-w-2xl">
              <p className="mb-3 inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-100">Operations overview</p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Good morning, keep every site accountable.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">Realtime attendance, geofence status, and scan confidence are stitched into one control room for today&apos;s shift.</p>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {["Face match", "GPS lock", "Device trust"].map((item, index) => (
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3" key={item}>
                  <p className="text-xs text-zinc-500">{item}</p>
                  <p className="mt-1 text-lg font-bold text-zinc-100">{98 - index * 3}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Shift pulse</p>
                <p className="text-xs text-muted-foreground">Last 12 hours</p>
              </div>
              <TrendingUp className="size-5 text-teal-200" />
            </div>
            <div className="mt-8 flex h-36 items-end gap-2">
              {bars.map((height, index) => (
                <motion.div className="flex-1 rounded-t-lg bg-[linear-gradient(180deg,#67e8f9,#34d399)] opacity-80" key={`${height}-${index}`} initial={shouldReduceMotion ? false : { height: "12%" }} animate={{ height: `${height}%` }} transition={{ duration: 0.7, delay: 0.08 + index * 0.035, ease: "easeOut" }} />
              ))}
            </div>
          </div>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => (
            <motion.div className="rounded-2xl border border-white/10 bg-card/75 p-5 shadow-[0_16px_45px_rgba(0,0,0,0.18)] backdrop-blur" key={metric.label} {...reveal(0.05 + index * 0.04)}>
              <div className="mb-5 flex items-center justify-between">
                <div className={`grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] ${metric.tone}`}>
                  <metric.icon className="size-5" />
                </div>
                <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-zinc-300">{metric.delta}</span>
              </div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-3xl font-black tracking-tight text-white">{metric.value}</p>
            </motion.div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <motion.div className="rounded-2xl border border-white/10 bg-card/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]" {...reveal(0.12)}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Live attendance</h2>
                <p className="text-sm text-muted-foreground">Latest verified presence events</p>
              </div>
              <span className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-muted-foreground">Today</span>
            </div>
            <div className="space-y-3">
              {rows.map((row, index) => (
                <motion.div className="grid gap-3 rounded-xl border border-white/10 bg-background/55 p-3 transition hover:border-white/20 hover:bg-white/[0.035] sm:grid-cols-[1fr_auto]" key={row.name} initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.32, delay: 0.2 + index * 0.05 }}>
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,rgba(45,212,191,0.18),rgba(56,189,248,0.12))] text-xs font-black text-teal-100">{row.name.slice(0, 2).toUpperCase()}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-100">{row.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{row.role} - {row.site}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end sm:text-right">
                    <p className={`text-xs font-bold ${row.tone}`}>{row.status}</p>
                    <p className="rounded-lg bg-white/[0.04] px-2 py-1 text-xs text-muted-foreground">{row.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="space-y-6" {...reveal(0.18)}>
              
            <div className="rounded-2xl border border-teal-300/15 bg-[linear-gradient(135deg,rgba(20,184,166,0.14),rgba(24,24,27,0.8))] p-5">
              <p className="text-sm font-bold text-white">Quick Actions</p>
              <div>
                {actions.map((action) => (
                  <a key={action.tittle} href={action.href} className="mt-3 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm font-semibold text-zinc-100 transition hover:border-white/20 hover:bg-white/[0.035]">
                    <action.icon className="size-4 text-teal-200" />
                    {action.tittle}
                  </a>
                ))}
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Warehouse and field teams usually peak late by 09:20. Watch the review queue for manual approvals.</p>
            </div>

            <div className="rounded-2xl border border-teal-300/15 bg-[linear-gradient(135deg,rgba(20,184,166,0.14),rgba(24,24,27,0.8))] p-5">
              <p className="text-sm font-bold text-white">Next risk window</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Warehouse and field teams usually peak late by 09:20. Watch the review queue for manual approvals.</p>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
