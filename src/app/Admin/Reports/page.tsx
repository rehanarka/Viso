"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, Clock3, ShieldCheck, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getDepartments } from "@/services/Admin/department";
import { Employee, getEmployees } from "@/services/Admin/employee";
import { AttendanceRecord, getAttendanceRecords } from "@/services/Admin/workspace";

export default function Reports() {
  const shouldReduceMotion = useReducedMotion();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const todayRecords = useMemo(() => records.filter((record) => record.attendance_date === today), [records, today]);
  const faceRate = records.length ? Math.round((records.filter((record) => record.verification_method === "face").length / records.length) * 100) : 0;
  const bars = [42, 56, 61, 48, 73, 88, 66, 77, 54, 69, 81, 72];

  useEffect(() => {
    void Promise.all([getEmployees(), getAttendanceRecords(), getDepartments()]).then(([employees, records, departments]) => { setEmployees(employees); setRecords(records); setDepartmentCount(departments.length); }).catch((error) => setError(error.message));
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_28%),#09090b] p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <motion.section className="mb-6 rounded-2xl border border-white/10 bg-card/80 p-6" initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100"><BarChart3 className="size-3.5" /> Reports</div>
          <h1 className="text-3xl font-black tracking-tight text-white">Workforce reporting</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Operational attendance summary for active employees, departments, and verification activity.</p>
        </motion.section>
        {error && <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}
        <section className="grid gap-4 md:grid-cols-4">
          {[{ label: "Employees", value: employees.length, icon: UsersRound }, { label: "Departments", value: departmentCount, icon: BarChart3 }, { label: "Today records", value: todayRecords.length, icon: Clock3 }, { label: "Face verification", value: `${faceRate}%`, icon: ShieldCheck }].map((item) => (
            <div className="rounded-2xl border border-white/10 bg-card/75 p-5" key={item.label}><item.icon className="mb-5 size-5 text-emerald-200" /><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-2 text-3xl font-black text-white">{item.value}</p></div>
          ))}
        </section>
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-white/10 bg-card/80 p-5"><h2 className="text-lg font-bold text-white">Attendance trend</h2><p className="text-sm text-muted-foreground">Placeholder trend until enough daily records exist.</p><div className="mt-8 flex h-56 items-end gap-3">{bars.map((height, index) => <div className="flex-1 rounded-t-lg bg-[linear-gradient(180deg,#67e8f9,#34d399)] opacity-80" key={index} style={{ height: `${height}%` }} />)}</div></div>
          <div className="rounded-2xl border border-white/10 bg-card/80 p-5"><h2 className="text-lg font-bold text-white">Verification mix</h2><div className="mt-5 space-y-4">{["face", "gps", "manual", "qr"].map((method) => { const count = records.filter((record) => record.verification_method === method).length; const percent = records.length ? Math.round((count / records.length) * 100) : 0; return <div key={method}><div className="mb-2 flex justify-between text-sm"><span className="capitalize text-zinc-200">{method}</span><span className="text-muted-foreground">{percent}%</span></div><div className="h-2 rounded-full bg-zinc-800"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${percent}%` }} /></div></div>; })}</div></div>
        </section>
      </div>
    </main>
  );
}
