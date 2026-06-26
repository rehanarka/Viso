"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock3, FileClock, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmployeeWorkspace, getEmployeeWorkspace } from "@/services/Employee/workspace";

export default function EmployeeAttendancePage() {
  const shouldReduceMotion = useReducedMotion();
  const [workspace, setWorkspace] = useState<EmployeeWorkspace | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const todayRecords = useMemo(() => workspace?.attendance.filter((record) => record.attendance_date === today) || [], [today, workspace]);

  useEffect(() => {
    void getEmployeeWorkspace().then(setWorkspace).catch((error) => setError(error.message)).finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_28%),#09090b] p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <motion.section className="mb-6 rounded-2xl border border-white/10 bg-card/80 p-6" initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100"><Clock3 className="size-3.5" /> My attendance</div>
          <h1 className="text-3xl font-black tracking-tight text-white">Attendance history</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Review your check-in, check-out, facecam, GPS, and admin manual attendance records.</p>
        </motion.section>

        {error && <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-card/75 p-4"><Clock3 className="mb-3 size-5 text-emerald-200" /><p className="text-sm text-muted-foreground">Today events</p><p className="mt-2 text-3xl font-black text-white">{todayRecords.length}</p></div>
          <div className="rounded-2xl border border-white/10 bg-card/75 p-4"><ShieldCheck className="mb-3 size-5 text-sky-200" /><p className="text-sm text-muted-foreground">Face verified</p><p className="mt-2 text-3xl font-black text-white">{workspace?.attendance.filter((record) => record.verification_method === "face").length || 0}</p></div>
          <div className="rounded-2xl border border-white/10 bg-card/75 p-4"><FileClock className="mb-3 size-5 text-amber-200" /><p className="text-sm text-muted-foreground">Total records</p><p className="mt-2 text-3xl font-black text-white">{workspace?.attendance.length || 0}</p></div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-card/80">
          <Table>
            <TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="px-4 text-xs uppercase tracking-[0.12em] text-zinc-500">Type</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Time</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Method</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Status</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Notes</TableHead></TableRow></TableHeader>
            <TableBody>
              {!isLoading && workspace?.attendance.map((record) => (
                <TableRow className="border-white/10 hover:bg-white/[0.035]" key={record.id}>
                  <TableCell className="px-4 py-3 text-zinc-300">{record.type === "check_in" ? "Check in" : "Check out"}</TableCell>
                  <TableCell className="text-zinc-300">{new Date(record.check_time).toLocaleString()}</TableCell>
                  <TableCell className="capitalize text-zinc-300">{record.verification_method}</TableCell>
                  <TableCell><Badge className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100" variant="outline">{record.status}</Badge></TableCell>
                  <TableCell className="max-w-[280px] truncate text-zinc-400">{record.notes || "-"}</TableCell>
                </TableRow>
              ))}
              {!isLoading && (!workspace?.attendance.length) && <TableRow className="border-white/10 hover:bg-transparent"><TableCell className="px-4 py-14 text-center" colSpan={5}><FileClock className="mx-auto mb-3 size-10 text-zinc-600" /><p className="text-sm font-bold text-zinc-100">No attendance records yet</p><p className="mt-1 text-sm text-muted-foreground">Your facecam scans and admin manual records will appear here.</p></TableCell></TableRow>}
            </TableBody>
          </Table>
          {isLoading && <div className="space-y-3 px-4 py-5">{[0, 1, 2].map((item) => <div className="h-14 animate-pulse rounded-xl bg-white/[0.045]" key={item} />)}</div>}
        </section>
      </div>
    </main>
  );
}
