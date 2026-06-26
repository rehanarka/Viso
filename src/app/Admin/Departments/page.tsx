"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Building2, CheckCircle2, Edit3, Plus, Search, Trash2, UsersRound, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addDepartment, deleteDepartment, Department, DepartmentPayload, DepartmentStatus, getDepartments, updateDepartment } from "@/services/Admin/department";
import { Employee, getEmployees } from "@/services/Admin/employee";

const statuses: DepartmentStatus[] = ["active", "inactive"];
const emptyForm: DepartmentPayload = { name: "", description: "", status: "active" };

function getStatusClass(status: DepartmentStatus) {
  return status === "active" ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" : "border-zinc-300/20 bg-zinc-300/10 text-zinc-200";
}

function getStatusLabel(status: DepartmentStatus) {
  return status === "active" ? "Active" : "Inactive";
}

export default function Departments() {
  const shouldReduceMotion = useReducedMotion();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DepartmentPayload>(emptyForm);
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const filteredDepartments = useMemo(() => {
    const search = query.trim().toLowerCase();
    return departments.filter((department) => !search || [department.name, department.description || "", department.status].some((value) => value.toLowerCase().includes(search)));
  }, [departments, query]);

  const employeeCounts = useMemo(() => {
    return employees.reduce<Record<string, number>>((counts, employee) => {
      if (!employee.department_id) return counts;
      counts[employee.department_id] = (counts[employee.department_id] || 0) + 1;
      return counts;
    }, {});
  }, [employees]);

  const reveal = (delay = 0) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.24, delay, ease: "easeOut" as const },
  });

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      setPageError("");
      const [latestDepartments, latestEmployees] = await Promise.all([getDepartments(), getEmployees()]);
      setDepartments(latestDepartments);
      setEmployees(latestEmployees);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Failed to load departments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDepartments();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormError("Please enter a department name before saving.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      if (editingId) {
        await updateDepartment(editingId, form);
      } else {
        await addDepartment(form);
      }

      const [latestDepartments, latestEmployees] = await Promise.all([getDepartments(), getEmployees()]);
      setDepartments(latestDepartments);
      setEmployees(latestEmployees);
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Department could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingId(department.id);
    setForm({ name: department.name, description: department.description || "", status: department.status });
    setFormError("");
    setIsFormOpen(true);
  };

  const handleDelete = async (departmentId: string) => {
    try {
      setPageError("");
      await deleteDepartment(departmentId);
      setDepartments((current) => current.filter((department) => department.id !== departmentId));
      setEmployees((current) => current.map((employee) => (employee.department_id === departmentId ? { ...employee, department_id: null } : employee)));
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Department could not be deleted.");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_28%),#09090b] p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <motion.section className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-card/80 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between" {...reveal()}>
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              <Building2 className="size-3.5" />
              Department Directory
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Manage departments</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Create the structure employees attach to before schedules, positions, and attendance rules get assigned.</p>
          </div>
          <Button className="h-10 rounded-xl bg-emerald-300 px-4 font-bold text-emerald-950 hover:bg-emerald-200" onClick={() => { resetForm(); setIsFormOpen((open) => !open); }} type="button">
            {isFormOpen && !editingId ? <X className="size-4" /> : <Plus className="size-4" />}
            {isFormOpen && !editingId ? "Close form" : "Add department"}
          </Button>
        </motion.section>

        {pageError && <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100" role="alert">{pageError}</p>}

        <AnimatePresence initial={false}>
          {isFormOpen && (
            <motion.form className="mb-6 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(24,24,27,0.96),rgba(13,17,19,0.94))] p-5" onSubmit={handleSubmit} initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: "easeOut" }}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white">{editingId ? "Edit department" : "Add department"}</h2>
                  <p className="text-sm text-muted-foreground">{editingId ? "Update this department record." : "Create a department employees can be assigned to."}</p>
                </div>
                <Button className="rounded-xl" onClick={() => { resetForm(); setIsFormOpen(false); }} type="button" variant="ghost">
                  <X className="size-4" />
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_220px]">
                <label className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-300">Department name</span>
                  <Input className="h-10 bg-background/60" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Operations" value={form.name} />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-300">Description</span>
                  <Input className="h-10 bg-background/60" onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Handles daily field activity" value={form.description} />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-300">Status</span>
                  <select className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm text-zinc-100 outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as DepartmentStatus }))} value={form.status}>
                    {statuses.map((status) => <option className="bg-zinc-950" key={status} value={status}>{getStatusLabel(status)}</option>)}
                  </select>
                </label>
              </div>

              {formError && <p className="mt-3 rounded-xl border border-red-300/20 bg-red-300/10 px-3 py-2 text-sm text-red-100" role="alert">{formError}</p>}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button className="h-10 rounded-xl" disabled={isSaving} onClick={() => { resetForm(); setIsFormOpen(false); }} type="button" variant="outline">Cancel</Button>
                <Button className="h-10 rounded-xl bg-emerald-300 px-5 font-bold text-emerald-950 hover:bg-emerald-200" disabled={isSaving} type="submit">
                  <CheckCircle2 className="size-4" />
                  {isSaving ? "Saving..." : editingId ? "Save changes" : "Create department"}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.section className="grid gap-4 md:grid-cols-3" {...reveal(0.04)}>
          <div className="rounded-2xl border border-white/10 bg-card/75 p-4">
            <p className="text-sm text-muted-foreground">Total departments</p>
            <p className="mt-2 text-3xl font-black text-white">{departments.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card/75 p-4">
            <p className="text-sm text-muted-foreground">Active departments</p>
            <p className="mt-2 text-3xl font-black text-white">{departments.filter((department) => department.status === "active").length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card/75 p-4">
            <p className="text-sm text-muted-foreground">Inactive departments</p>
            <p className="mt-2 text-3xl font-black text-white">{departments.filter((department) => department.status === "inactive").length}</p>
          </div>
        </motion.section>

        <motion.section className="mt-6 rounded-2xl border border-white/10 bg-card/80" {...reveal(0.08)}>
          <div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Department list</h2>
              <p className="text-sm text-muted-foreground">Departments are available inside employee assignment.</p>
            </div>
            <div className="relative min-w-0 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <Input className="h-10 bg-background/60 pl-9" onChange={(event) => setQuery(event.target.value)} placeholder="Search departments..." value={query} />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="px-4 text-xs uppercase tracking-[0.12em] text-zinc-500">Department</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Description</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Employees</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Status</TableHead>
                <TableHead className="px-4 text-right text-xs uppercase tracking-[0.12em] text-zinc-500">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && filteredDepartments.map((department, index) => (
                <motion.tr className="border-b border-white/10 transition-colors hover:bg-white/[0.035]" key={department.id} initial={shouldReduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: index * 0.025 }}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-100">
                        <UsersRound className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">{department.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{department.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-xl truncate text-sm text-zinc-300">{department.description || "No description"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-1 text-sm font-semibold text-zinc-100">
                      <UsersRound className="size-4 text-zinc-500" />
                      {employeeCounts[department.id] || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusClass(department.status)} variant="outline">{getStatusLabel(department.status)}</Badge>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex justify-end gap-2">
                      <Button aria-label={`Edit ${department.name}`} className="rounded-xl" onClick={() => handleEdit(department)} size="icon-sm" type="button" variant="ghost">
                        <Edit3 className="size-4" />
                      </Button>
                      <Button aria-label={`Delete ${department.name}`} className="rounded-xl text-red-200 hover:bg-red-300/10 hover:text-red-100" onClick={() => void handleDelete(department.id)} size="icon-sm" type="button" variant="ghost">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>

          {isLoading && (
            <div className="space-y-3 px-4 py-5">
              {[0, 1, 2].map((item) => <div className="h-14 animate-pulse rounded-xl bg-white/[0.045]" key={item} />)}
            </div>
          )}

          {!isLoading && filteredDepartments.length === 0 && (
            <div className="grid place-items-center px-4 py-14 text-center">
              <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.035] text-zinc-500"><Building2 className="size-6" /></div>
              <p className="text-sm font-bold text-zinc-100">{departments.length === 0 ? "No departments yet" : "No departments match this search"}</p>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{departments.length === 0 ? "Create at least one department so employees can be grouped before attendance reports are reviewed." : "Clear the search field to see every department again."}</p>
              {departments.length === 0 ? <Button className="mt-4 h-10 rounded-xl bg-emerald-300 px-4 font-bold text-emerald-950 hover:bg-emerald-200" onClick={() => { resetForm(); setIsFormOpen(true); }} type="button"><Plus className="size-4" />Add department</Button> : <Button className="mt-4 h-10 rounded-xl" onClick={() => setQuery("")} type="button" variant="outline">Clear search</Button>}
            </div>
          )}
        </motion.section>
      </div>
    </main>
  );
}
