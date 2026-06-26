"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, Clock3, FileClock, MapPin, PenLine, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Employee, getEmployeeId, getEmployees } from "@/services/Admin/employee";
import { addManualAttendance, AttendanceRecord, getAttendanceRecords, ManualAttendancePayload } from "@/services/Admin/workspace";

const statusOptions: ManualAttendancePayload["status"][] = ["present", "late", "absent", "sick", "leave"];
const typeOptions: ManualAttendancePayload["type"][] = ["check_in", "check_out"];

function getLocalDateTimeInput() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export default function Attendance() {
  const shouldReduceMotion = useReducedMotion();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ManualAttendancePayload>({ attendance_date: new Date().toISOString().slice(0, 10), check_time: getLocalDateTimeInput(), employee_id: "", notes: "", status: "late", type: "check_in" });
  const todayRecords = useMemo(() => records.filter((record) => record.attendance_date === new Date().toISOString().slice(0, 10)), [records]);

  async function loadAttendance() {
    const [employeeRows, recordRows] = await Promise.all([getEmployees(), getAttendanceRecords()]);
    setEmployees(employeeRows);
    setRecords(recordRows);
    setForm((current) => ({ ...current, employee_id: current.employee_id || getEmployeeId(employeeRows[0] || {}) }));
  }

  useEffect(() => {
    void loadAttendance().catch((error) => setError(error.message)).finally(() => setIsLoading(false));
  }, []);

  async function handleManualAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      if (!form.employee_id) throw new Error("Select an employee before saving manual attendance.");
      await addManualAttendance(form);
      await loadAttendance();
      setForm((current) => ({ ...current, check_time: getLocalDateTimeInput(), notes: "" }));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Manual attendance could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_28%),#09090b] p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <motion.section className="mb-6 rounded-2xl border border-white/10 bg-card/80 p-6" initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100"><Activity className="size-3.5" /> Attendance monitor</div>
          <h1 className="text-3xl font-black tracking-tight text-white">Attendance records</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Review check-in and check-out activity from face, GPS, QR, or manual verification.</p>
        </motion.section>

        {error && <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-card/75 p-4"><Clock3 className="mb-3 size-5 text-emerald-200" /><p className="text-sm text-muted-foreground">Today events</p><p className="mt-2 text-3xl font-black text-white">{todayRecords.length}</p></div>
          <div className="rounded-2xl border border-white/10 bg-card/75 p-4"><ShieldCheck className="mb-3 size-5 text-sky-200" /><p className="text-sm text-muted-foreground">Face verified</p><p className="mt-2 text-3xl font-black text-white">{records.filter((record) => record.verification_method === "face").length}</p></div>
          <div className="rounded-2xl border border-white/10 bg-card/75 p-4"><MapPin className="mb-3 size-5 text-amber-200" /><p className="text-sm text-muted-foreground">GPS/manual events</p><p className="mt-2 text-3xl font-black text-white">{records.filter((record) => record.verification_method !== "face").length}</p></div>
        </section>

        <motion.section className="mb-6 rounded-2xl border border-emerald-300/15 bg-[linear-gradient(135deg,rgba(16,185,129,0.1),rgba(12,12,14,0.9)_34%)] p-5" initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-emerald-100"><PenLine className="size-3.5" /> Manual entry</div><h2 className="text-xl font-black text-white">Record attendance for a team member</h2><p className="mt-1 text-sm text-zinc-400">Use this for late corrections, approved absence, sick leave, or a missed facecam scan.</p></div><p className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-100">Admin override</p></div>
          <form className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] lg:items-end" onSubmit={handleManualAttendance}>
            <label className="space-y-2 text-sm font-semibold text-zinc-200">Employee<select className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-emerald-300/60" value={form.employee_id} onChange={(event) => setForm((current) => ({ ...current, employee_id: event.target.value }))}>{employees.length === 0 && <option value="">No employee yet</option>}{employees.map((employee) => <option key={getEmployeeId(employee)} value={getEmployeeId(employee)}>{employee.full_name} · {employee.employee_code || employee.email}</option>)}</select></label>
            <label className="space-y-2 text-sm font-semibold text-zinc-200">Type<select className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-emerald-300/60" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as ManualAttendancePayload["type"] }))}>{typeOptions.map((type) => <option key={type} value={type}>{type === "check_in" ? "Check in" : "Check out"}</option>)}</select></label>
            <label className="space-y-2 text-sm font-semibold text-zinc-200">Status<select className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm capitalize text-white outline-none transition focus:border-emerald-300/60" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ManualAttendancePayload["status"] }))}>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            <label className="space-y-2 text-sm font-semibold text-zinc-200">Date<input className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-emerald-300/60" type="date" value={form.attendance_date} onChange={(event) => setForm((current) => ({ ...current, attendance_date: event.target.value }))} /></label>
            <label className="space-y-2 text-sm font-semibold text-zinc-200">Time<input className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-emerald-300/60" type="datetime-local" value={form.check_time} onChange={(event) => setForm((current) => ({ ...current, check_time: event.target.value }))} /></label>
            <label className="space-y-2 text-sm font-semibold text-zinc-200 lg:col-span-4">Notes<input className="h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-300/60" placeholder="Example: Late because approved client visit" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></label>
            <button className="h-11 rounded-xl bg-emerald-300 px-5 text-sm font-black text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSaving || employees.length === 0} type="submit">{isSaving ? "Saving..." : "Save manual"}</button>
          </form>
        </motion.section>

        <section className="rounded-2xl border border-white/10 bg-card/80">
          <Table>
            <TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="px-4 text-xs uppercase tracking-[0.12em] text-zinc-500">Employee</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Type</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Time</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Method</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Status</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Notes</TableHead></TableRow></TableHeader>
            <TableBody>
              {!isLoading && records.map((record) => (
                <TableRow className="border-white/10 hover:bg-white/[0.035]" key={record.id}>
                  <TableCell className="px-4 py-3"><p className="font-semibold text-zinc-100">{record.employees?.full_name || "Unknown employee"}</p><p className="font-mono text-xs text-muted-foreground">{record.employees?.employee_code || record.employee_id.slice(0, 8)}</p></TableCell>
                  <TableCell className="text-zinc-300">{record.type === "check_in" ? "Check in" : "Check out"}</TableCell>
                  <TableCell className="text-zinc-300">{new Date(record.check_time).toLocaleString()}</TableCell>
                  <TableCell className="capitalize text-zinc-300">{record.verification_method}</TableCell>
                  <TableCell><Badge className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100" variant="outline">{record.status}</Badge></TableCell>
                  <TableCell className="max-w-[260px] truncate text-zinc-400">{record.notes || "-"}</TableCell>
                </TableRow>
              ))}
              {!isLoading && records.length === 0 && (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell className="px-4 py-14" colSpan={6}>
                    <div className="mx-auto flex max-w-md flex-col items-center text-center">
                      <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.035] text-zinc-500"><FileClock className="size-6" /></div>
                      <p className="text-sm font-bold text-zinc-100">No attendance records yet</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">Facecam scans and manual admin entries will appear here once employees start recording presence.</p>
                      <button className="mt-4 h-10 rounded-xl bg-emerald-300 px-4 text-sm font-black text-zinc-950 transition hover:bg-emerald-200" onClick={() => document.querySelector<HTMLSelectElement>("select")?.focus()} type="button">Create manual entry</button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {isLoading && <div className="space-y-3 px-4 py-5">{[0, 1, 2].map((item) => <div className="h-14 animate-pulse rounded-xl bg-white/[0.045]" key={item} />)}</div>}
        </section>
      </div>
    </main>
  );
}
