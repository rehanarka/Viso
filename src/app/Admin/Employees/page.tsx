"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Edit3, Filter, Mail, Plus, Search, ShieldCheck, Trash2, UserRound, UsersRound, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Department, getDepartments } from "@/services/Admin/department";
import { addEmployee, deleteEmployee, Employee, EmployeePayload, EmployeeStatus, getEmployeeId, getEmployees, updateEmployee } from "@/services/Admin/employee";

const statuses: EmployeeStatus[] = ["active", "inactive", "resigned"];
const emptyForm: EmployeePayload = { full_name: "", email: "", position: "", division: "", department_id: null, status: "active" };

function getInitials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function getStatusClass(status: EmployeeStatus) {
  if (status === "active") return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  if (status === "inactive") return "border-zinc-300/20 bg-zinc-300/10 text-zinc-200";
  return "border-amber-300/25 bg-amber-300/10 text-amber-100";
}

function getStatusLabel(status: EmployeeStatus) {
  if (status === "active") return "Active";
  if (status === "inactive") return "Inactive";
  return "Resigned";
}

export default function Employees() {
  const shouldReduceMotion = useReducedMotion();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All departments");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeePayload>(emptyForm);
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const filteredEmployees = useMemo(() => {
    const search = query.trim().toLowerCase();
    return employees.filter((employee) => {
      const departmentName = departments.find((department) => department.id === employee.department_id)?.name || "Unassigned";
      const matchesDepartment = departmentFilter === "All departments" || employee.department_id === departmentFilter;
      const matchesSearch = !search || [employee.full_name, employee.email || "", employee.position || "", departmentName, employee.employee_code].some((value) => value.toLowerCase().includes(search));
      return matchesDepartment && matchesSearch;
    });
  }, [departmentFilter, departments, employees, query]);

  const reveal = (delay = 0) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.24, delay, ease: "easeOut" as const },
  });

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setPageError("");
      const [latestDepartments, latestEmployees] = await Promise.all([getDepartments(), getEmployees()]);
      setDepartments(latestDepartments);
      setEmployees(latestEmployees);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Failed to load employees.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadEmployees();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || !form.position.trim()) {
      setFormError("Please complete name, email, and position before saving.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      if (editingId) {
        await updateEmployee(editingId, form);
      } else {
        await addEmployee(form);
      }

      const latestEmployees = await getEmployees();
      setEmployees(latestEmployees);
      setPageError("");
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Employee could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(getEmployeeId(employee));
    setForm({ full_name: employee.full_name, email: employee.email || "", position: employee.position || "", division: "", department_id: employee.department_id || null, status: employee.status });
    setFormError("");
    setIsFormOpen(true);
  };

  const handleDelete = async (employeeId: string) => {
    try {
      setPageError("");
      await deleteEmployee(employeeId);
      setEmployees((current) => current.filter((employee) => getEmployeeId(employee) !== employeeId));
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Employee could not be deleted.");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_28%),#09090b] p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <motion.section className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-card/80 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between" {...reveal()}>
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              <UsersRound className="size-3.5" />
              Employee Directory
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Manage employee records</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Add team members, review department assignments, and keep attendance records ready for verification.</p>
          </div>
          <Button className="h-10 rounded-xl bg-emerald-300 px-4 font-bold text-emerald-950 hover:bg-emerald-200" onClick={() => { resetForm(); setIsFormOpen((open) => !open); }} type="button">
            {isFormOpen && !editingId ? <X className="size-4" /> : <Plus className="size-4" />}
            {isFormOpen && !editingId ? "Close form" : "Add new employee"}
          </Button>
        </motion.section>

        {pageError && <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100" role="alert">{pageError}</p>}

        <AnimatePresence initial={false}>
          {isFormOpen && (
            <motion.form className="mb-6 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(24,24,27,0.96),rgba(13,17,19,0.94))] p-5" onSubmit={handleSubmit} initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: "easeOut" }}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white">{editingId ? "Edit employee" : "Add new employee"}</h2>
                  <p className="text-sm text-muted-foreground">{editingId ? "Update employee details in the directory." : "Create a new employee record for attendance tracking."}</p>
                </div>
                <Button className="rounded-xl" onClick={() => { resetForm(); setIsFormOpen(false); }} type="button" variant="ghost">
                  <X className="size-4" />
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-300">Full name</span>
                  <Input className="h-10 bg-background/60" onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} placeholder="e.g. Sarah Wijaya" value={form.full_name} />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-300">Email</span>
                  <Input className="h-10 bg-background/60" onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="name@company.com" type="email" value={form.email} />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-300">Position</span>
                  <Input className="h-10 bg-background/60" onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))} placeholder="Operations Staff" value={form.position} />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-300">Department</span>
                  <select className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm text-zinc-100 outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" onChange={(event) => setForm((current) => ({ ...current, department_id: event.target.value || null }))} value={form.department_id || ""}>
                    <option className="bg-zinc-950" value="">No department</option>
                    {departments.map((department) => <option className="bg-zinc-950" key={department.id} value={department.id}>{department.name}</option>)}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-300">Status</span>
                  <select className="h-10 w-full rounded-lg border border-input bg-background/60 px-3 text-sm text-zinc-100 outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as EmployeeStatus }))} value={form.status}>
                    {statuses.map((item) => <option className="bg-zinc-950" key={item} value={item.toLowerCase()}>{getStatusLabel(item)}</option>)}
                  </select>
                </label>
              </div>

              {formError && <p className="mt-3 rounded-xl border border-red-300/20 bg-red-300/10 px-3 py-2 text-sm text-red-100" role="alert">{formError}</p>}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button className="h-10 rounded-xl" disabled={isSaving} onClick={() => { resetForm(); setIsFormOpen(false); }} type="button" variant="outline">Cancel</Button>
                <Button className="h-10 rounded-xl bg-emerald-300 px-5 font-bold text-emerald-950 hover:bg-emerald-200" disabled={isSaving} type="submit">
                  <CheckCircle2 className="size-4" />
                  {isSaving ? "Saving..." : editingId ? "Save changes" : "Create employee"}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.section className="grid gap-4 md:grid-cols-3" {...reveal(0.04)}>
          <div className="rounded-2xl border border-white/10 bg-card/75 p-4">
            <p className="text-sm text-muted-foreground">Total employees</p>
            <p className="mt-2 text-3xl font-black text-white">{employees.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card/75 p-4">
            <p className="text-sm text-muted-foreground">Active employees</p>
            <p className="mt-2 text-3xl font-black text-white">{employees.filter((employee) => employee.status === "active").length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card/75 p-4">
            <p className="text-sm text-muted-foreground">Departments used</p>
            <p className="mt-2 text-3xl font-black text-white">{new Set(employees.map((employee) => employee.department_id || "Unassigned")).size}</p>
          </div>
        </motion.section>

        <motion.section className="mt-6 rounded-2xl border border-white/10 bg-card/80" {...reveal(0.08)}>
          <div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Employee list</h2>
              <p className="text-sm text-muted-foreground">Search, filter, and manage workforce records.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <Input className="h-10 bg-background/60 pl-9" onChange={(event) => setQuery(event.target.value)} placeholder="Search employees..." value={query} />
              </div>
              <div className="relative sm:w-52">
                <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <select className="h-10 w-full rounded-lg border border-input bg-background/60 pl-9 pr-3 text-sm text-zinc-100 outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" onChange={(event) => setDepartmentFilter(event.target.value)} value={departmentFilter}>
                  <option className="bg-zinc-950">All departments</option>
                  {departments.map((department) => <option className="bg-zinc-950" key={department.id} value={department.id}>{department.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="px-4 text-xs uppercase tracking-[0.12em] text-zinc-500">Employee</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Department</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Code</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Status</TableHead>
                <TableHead className="px-4 text-right text-xs uppercase tracking-[0.12em] text-zinc-500">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && filteredEmployees.map((employee, index) => (
                <motion.tr className="border-b border-white/10 transition-colors hover:bg-white/[0.035]" key={getEmployeeId(employee)} initial={shouldReduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: index * 0.025 }}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border border-white/10" size="lg">
                        <AvatarFallback className="bg-[linear-gradient(135deg,rgba(45,212,191,0.22),rgba(56,189,248,0.16))] font-bold text-teal-100">{getInitials(employee.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-100">{employee.full_name}</p>
                        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><Mail className="size-3" />{employee.email || "No email"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-zinc-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{departments.find((department) => department.id === employee.department_id)?.name || "Unassigned"}</p>
                        <p className="text-xs text-muted-foreground">{employee.position || "No position assigned"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-mono text-xs text-zinc-300">{employee.employee_code}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusClass(employee.status)} variant="outline">{getStatusLabel(employee.status)}</Badge>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex justify-end gap-2">
                      <Button aria-label={`Edit ${employee.full_name}`} className="rounded-xl" onClick={() => handleEdit(employee)} size="icon-sm" type="button" variant="ghost">
                        <Edit3 className="size-4" />
                      </Button>
                      <Button aria-label={`Delete ${employee.full_name}`} className="rounded-xl text-red-200 hover:bg-red-300/10 hover:text-red-100" onClick={() => void handleDelete(getEmployeeId(employee))} size="icon-sm" type="button" variant="ghost">
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

          {!isLoading && filteredEmployees.length === 0 && (
            <div className="grid place-items-center px-4 py-14 text-center">
              <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.035] text-zinc-500"><UserRound className="size-6" /></div>
              <p className="text-sm font-bold text-zinc-100">{employees.length === 0 ? "No employees yet" : "No employees match this view"}</p>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{employees.length === 0 ? "Create the first employee record so attendance, departments, and account activation have someone to attach to." : "Try clearing the search or switching the department filter."}</p>
              {employees.length === 0 ? <Button className="mt-4 h-10 rounded-xl bg-emerald-300 px-4 font-bold text-emerald-950 hover:bg-emerald-200" onClick={() => { resetForm(); setIsFormOpen(true); }} type="button"><Plus className="size-4" />Add employee</Button> : <Button className="mt-4 h-10 rounded-xl" onClick={() => { setQuery(""); setDepartmentFilter("All departments"); }} type="button" variant="outline">Clear filters</Button>}
            </div>
          )}
        </motion.section>
      </div>
    </main>
  );
}
