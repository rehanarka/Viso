"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarClock, CheckCircle2, Edit3, Plus, TimerOff, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addShift, deleteShift, getShifts, Shift, ShiftPayload, updateShift } from "@/services/Admin/workspace";

const emptyForm: ShiftPayload = { name: "", start_time: "09:00", end_time: "17:00", late_tolerance_minutes: 10, status: "active" };

export default function Schedules() {
  const shouldReduceMotion = useReducedMotion();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [form, setForm] = useState<ShiftPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadShifts = async () => {
    try {
      setIsLoading(true);
      setError("");
      setShifts(await getShifts());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load schedules.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadShifts(); }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Shift name is required.");
      return;
    }
    try {
      setIsSaving(true);
      if (editingId) await updateShift(editingId, form);
      else await addShift(form);
      setShifts(await getShifts());
      setForm(emptyForm);
      setEditingId(null);
      setIsFormOpen(false);
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Schedule could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_28%),#09090b] p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <motion.section className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-card/80 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between" initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100"><CalendarClock className="size-3.5" /> Shift schedules</div>
            <h1 className="text-3xl font-black tracking-tight text-white">Manage schedules</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Create active shift windows used by employees and attendance rules.</p>
          </div>
          <Button className="h-10 rounded-xl bg-emerald-300 px-4 font-bold text-emerald-950 hover:bg-emerald-200" onClick={() => { setForm(emptyForm); setEditingId(null); setIsFormOpen((open) => !open); }} type="button">{isFormOpen ? <X className="size-4" /> : <Plus className="size-4" />}{isFormOpen ? "Close form" : "Add shift"}</Button>
        </motion.section>

        {error && <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}

        {isFormOpen && (
          <form className="mb-6 rounded-2xl border border-white/10 bg-card/80 p-5" onSubmit={submit}>
            <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_180px_180px]">
              <label className="space-y-2"><span className="text-xs font-semibold text-zinc-300">Shift name</span><Input className="h-10 bg-background/60" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Morning shift" value={form.name} /></label>
              <label className="space-y-2"><span className="text-xs font-semibold text-zinc-300">Start</span><Input className="h-10 bg-background/60" onChange={(event) => setForm((current) => ({ ...current, start_time: event.target.value }))} type="time" value={form.start_time} /></label>
              <label className="space-y-2"><span className="text-xs font-semibold text-zinc-300">End</span><Input className="h-10 bg-background/60" onChange={(event) => setForm((current) => ({ ...current, end_time: event.target.value }))} type="time" value={form.end_time} /></label>
              <label className="space-y-2"><span className="text-xs font-semibold text-zinc-300">Late tolerance</span><Input className="h-10 bg-background/60" min={0} onChange={(event) => setForm((current) => ({ ...current, late_tolerance_minutes: Number(event.target.value) }))} type="number" value={form.late_tolerance_minutes} /></label>
              <label className="space-y-2"><span className="text-xs font-semibold text-zinc-300">Status</span><select className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm text-zinc-100" onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ShiftPayload["status"] }))} value={form.status}><option className="bg-zinc-950" value="active">Active</option><option className="bg-zinc-950" value="inactive">Inactive</option></select></label>
            </div>
            <div className="mt-5 flex justify-end gap-3"><Button disabled={isSaving} type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200" disabled={isSaving} type="submit"><CheckCircle2 className="size-4" />{editingId ? "Save changes" : "Create shift"}</Button></div>
          </form>
        )}

        <section className="rounded-2xl border border-white/10 bg-card/80">
          <Table>
            <TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="px-4 text-xs uppercase tracking-[0.12em] text-zinc-500">Shift</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Window</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Tolerance</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Status</TableHead><TableHead className="px-4 text-right text-xs uppercase tracking-[0.12em] text-zinc-500">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {!isLoading && shifts.map((shift) => (
                <TableRow className="border-white/10 hover:bg-white/[0.035]" key={shift.id}>
                  <TableCell className="px-4 py-3 font-semibold text-zinc-100">{shift.name}</TableCell>
                  <TableCell className="text-zinc-300">{shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}</TableCell>
                  <TableCell className="text-zinc-300">{shift.late_tolerance_minutes} min</TableCell>
                  <TableCell><Badge className={shift.status === "active" ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" : "border-zinc-300/20 bg-zinc-300/10 text-zinc-200"} variant="outline">{shift.status === "active" ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell className="px-4"><div className="flex justify-end gap-2"><Button size="icon-sm" type="button" variant="ghost" onClick={() => { setEditingId(shift.id); setForm({ name: shift.name, start_time: shift.start_time.slice(0, 5), end_time: shift.end_time.slice(0, 5), late_tolerance_minutes: shift.late_tolerance_minutes, status: shift.status }); setIsFormOpen(true); }}><Edit3 className="size-4" /></Button><Button className="text-red-200 hover:bg-red-300/10 hover:text-red-100" size="icon-sm" type="button" variant="ghost" onClick={() => void deleteShift(shift.id).then(loadShifts).catch((error) => setError(error.message))}><Trash2 className="size-4" /></Button></div></TableCell>
                </TableRow>
              ))}
              {!isLoading && shifts.length === 0 && (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell className="px-4 py-14" colSpan={5}>
                    <div className="mx-auto flex max-w-md flex-col items-center text-center">
                      <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.035] text-zinc-500"><TimerOff className="size-6" /></div>
                      <p className="text-sm font-bold text-zinc-100">No shifts configured</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">Create the first shift window before assigning schedules or comparing late check-ins.</p>
                      <Button className="mt-4 h-10 rounded-xl bg-emerald-300 px-4 font-bold text-emerald-950 hover:bg-emerald-200" onClick={() => { setForm(emptyForm); setEditingId(null); setIsFormOpen(true); }} type="button"><Plus className="size-4" />Add shift</Button>
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
