"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, BadgeCheck, Clock3, MapPin, ShieldCheck, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Employee, getEmployees } from "@/services/Admin/employee";
import { AttendanceRecord, Company, CompanySettings, getAttendanceRecords, getCompany, getCompanySettings } from "@/services/Admin/workspace";

const actions = [
  { title: "Manage employees", href: "/Admin/Employees", icon: BadgeCheck },
  { title: "Set company location", href: "/Admin/Company", icon: MapPin },
  { title: "Create shifts", href: "/Admin/Schedules", icon: Clock3 },
];

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function getInitials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function getLastSevenDays() {
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });
}

export default function Dashboard() {
  const shouldReduceMotion = useReducedMotion();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const todayRecords = useMemo(() => records.filter((record) => record.attendance_date === today), [records, today]);
  const presentToday = useMemo(() => new Set(todayRecords.filter((record) => record.type === "check_in").map((record) => record.employee_id)).size, [todayRecords]);
  const lateToday = todayRecords.filter((record) => record.status === "late").length;
  const faceRecords = records.filter((record) => record.verification_method === "face");
  const faceRate = records.length ? Math.round((faceRecords.length / records.length) * 100) : 0;
  const latestRecords = todayRecords.slice(0, 5);
  const chartData = useMemo(() => {
    const days = getLastSevenDays();
    const counts = days.map((date) => records.filter((record) => record.attendance_date === date && record.type === "check_in").length);
    const max = Math.max(...counts, 1);
    return days.map((date, index) => ({ date, count: counts[index], height: Math.max(8, Math.round((counts[index] / max) * 100)) }));
  }, [records]);
  const setupItems = [
    { label: "Company location", ready: Boolean(company?.office_latitude && company?.office_longitude) },
    { label: "GPS validation", ready: settings?.enable_gps !== false },
    { label: "Face verification", ready: settings?.enable_face_verification !== false },
  ];
  const reveal = (delay = 0) => ({
    animate: { opacity: 1, y: 0 },
    initial: shouldReduceMotion ? false : { opacity: 0, y: 18 },
    transition: { delay, duration: 0.32, ease: "easeOut" as const },
  });

  useEffect(() => {
    void Promise.all([getEmployees(), getAttendanceRecords(), getCompany(), getCompanySettings()])
      .then(([employees, records, company, settings]) => {
        setEmployees(employees);
        setRecords(records);
        setCompany(company);
        setSettings(settings);
      })
      .catch((error) => setError(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  const metrics = [
    { label: "Present today", value: presentToday, helper: `${todayRecords.length} record${todayRecords.length === 1 ? "" : "s"}`, tone: "text-teal-200", icon: Users },
    { label: "Late records", value: lateToday, helper: "Today", tone: "text-amber-200", icon: Clock3 },
    { label: "Face verification", value: `${faceRate}%`, helper: `${faceRecords.length} of ${records.length}`, tone: "text-sky-200", icon: ShieldCheck },
    { label: "Employees", value: employees.length, helper: "In this company", tone: "text-emerald-200", icon: Activity },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_0%,rgba(45,212,191,0.14),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(125,211,252,0.1),transparent_24%),#09090b] p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <motion.section className="mb-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]" {...reveal()}>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(24,24,27,0.94),rgba(13,17,19,0.92))] p-6">
            <div className="relative z-10 max-w-2xl">
              <p className="mb-3 inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-100">Admin overview</p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Today&apos;s attendance control room</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">Review employee activity, face verification usage, late records, and setup readiness from your workspace data.</p>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {setupItems.map((item) => (
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3" key={item.label}>
                  <p className="text-xs text-zinc-500">{item.label}</p>
                  <p className={`mt-1 text-sm font-bold ${item.ready ? "text-emerald-100" : "text-amber-100"}`}>{item.ready ? "Ready" : "Needs setup"}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card/80 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">7-day check-in trend</p>
                <p className="text-xs text-muted-foreground">Based on saved attendance records</p>
              </div>
              <TrendingUp className="size-5 text-teal-200" />
            </div>
            <div className="mt-8 flex h-36 items-end gap-2">
              {chartData.map((day, index) => (
                <motion.div className="flex-1 rounded-t-lg bg-[linear-gradient(180deg,#67e8f9,#34d399)] opacity-80" key={day.date} initial={shouldReduceMotion ? false : { height: "8%" }} animate={{ height: `${day.height}%` }} title={`${day.date}: ${day.count}`} transition={{ delay: 0.05 + index * 0.035, duration: 0.42, ease: "easeOut" }} />
              ))}
            </div>
          </div>
        </motion.section>

        {error && <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => (
            <motion.div className="rounded-2xl border border-white/10 bg-card/75 p-5" key={metric.label} {...reveal(0.04 + index * 0.03)}>
              <div className="mb-5 flex items-center justify-between">
                <div className={`grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] ${metric.tone}`}>
                  <metric.icon className="size-5" />
                </div>
                <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-zinc-300">{metric.helper}</span>
              </div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-3xl font-black tracking-tight text-white">{isLoading ? "-" : metric.value}</p>
            </motion.div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <motion.div className="rounded-2xl border border-white/10 bg-card/80 p-5" {...reveal(0.12)}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Latest attendance</h2>
                <p className="text-sm text-muted-foreground">Today&apos;s newest records</p>
              </div>
              <span className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-muted-foreground">Today</span>
            </div>
            <div className="space-y-3">
              {latestRecords.map((row, index) => (
                <motion.div className="grid gap-3 rounded-xl border border-white/10 bg-background/55 p-3 transition hover:border-white/20 hover:bg-white/[0.035] sm:grid-cols-[1fr_auto]" key={row.id} initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + index * 0.04, duration: 0.24 }}>
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-xs font-black text-teal-100">{getInitials(row.employees?.full_name || "Employee")}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-100">{row.employees?.full_name || "Unknown employee"}</p>
                      <p className="truncate text-xs text-muted-foreground">{row.type.replace("_", " ")} - {row.verification_method}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end sm:text-right">
                    <p className={row.status === "late" ? "text-xs font-bold text-amber-200" : "text-xs font-bold text-emerald-200"}>{row.status}</p>
                    <p className="rounded-lg bg-white/[0.04] px-2 py-1 text-xs text-muted-foreground">{formatTime(row.check_time)}</p>
                  </div>
                </motion.div>
              ))}
              {!isLoading && latestRecords.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-background/40 p-8 text-center">
                  <p className="text-sm font-bold text-zinc-100">No attendance records today</p>
                  <p className="mt-1 text-sm text-muted-foreground">Employee face attendance and manual admin entries will appear here.</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div className="space-y-6" {...reveal(0.18)}>
            <div className="rounded-2xl border border-teal-300/15 bg-[linear-gradient(135deg,rgba(20,184,166,0.14),rgba(24,24,27,0.8))] p-5">
              <p className="text-sm font-bold text-white">Quick actions</p>
              <div className="mt-3 space-y-3">
                {actions.map((action) => (
                  <Link key={action.title} href={action.href} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm font-semibold text-zinc-100 transition hover:border-white/20 hover:bg-white/[0.055]">
                    <action.icon className="size-4 text-teal-200" />
                    {action.title}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/80 p-5">
              <p className="text-sm font-bold text-white">Workspace note</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{company?.name ? `${company.name} is using ${company.allowed_radius_meters || 100}m as the default attendance radius.` : "Finish company setup so employee attendance can validate GPS distance."}</p>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
