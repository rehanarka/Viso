"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Mail, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmployeeWorkspace, getEmployeeWorkspace } from "@/services/Employee/workspace";

function getInitials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function EmployeeDepartmentPage() {
  const shouldReduceMotion = useReducedMotion();
  const [workspace, setWorkspace] = useState<EmployeeWorkspace | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getEmployeeWorkspace().then(setWorkspace).catch((error) => setError(error.message)).finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_28%),#09090b] p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <motion.section className="mb-6 rounded-2xl border border-white/10 bg-card/80 p-6" initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100"><UsersRound className="size-3.5" /> My department</div>
          <h1 className="text-3xl font-black tracking-tight text-white">{workspace?.department?.name || "Department team"}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{workspace?.department?.description || "See teammates assigned to the same department for daily coordination and presence awareness."}</p>
        </motion.section>

        {error && <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}

        <section className="rounded-2xl border border-white/10 bg-card/80">
          <div className="border-b border-white/10 p-4"><h2 className="text-lg font-bold text-white">Department teammates</h2><p className="text-sm text-muted-foreground">People attached to the same department as your employee record.</p></div>
          <Table>
            <TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="px-4 text-xs uppercase tracking-[0.12em] text-zinc-500">Employee</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Position</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Code</TableHead><TableHead className="text-xs uppercase tracking-[0.12em] text-zinc-500">Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {!isLoading && workspace?.peers.map((employee) => (
                <TableRow className="border-white/10 hover:bg-white/[0.035]" key={employee.id || employee.employees_id}>
                  <TableCell className="px-4 py-3"><div className="flex items-center gap-3"><Avatar className="size-10 border border-white/10" size="lg"><AvatarFallback className="bg-emerald-300/10 font-bold text-emerald-100">{getInitials(employee.full_name)}</AvatarFallback></Avatar><div><p className="font-semibold text-zinc-100">{employee.full_name}</p><p className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="size-3" />{employee.email || "No email"}</p></div></div></TableCell>
                  <TableCell className="text-zinc-300">{employee.position || "No position"}</TableCell>
                  <TableCell className="font-mono text-xs text-zinc-400">{employee.employee_code}</TableCell>
                  <TableCell><Badge className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100" variant="outline">{employee.status}</Badge></TableCell>
                </TableRow>
              ))}
              {!isLoading && (!workspace?.peers.length) && <TableRow className="border-white/10 hover:bg-transparent"><TableCell className="px-4 py-14 text-center" colSpan={4}><UsersRound className="mx-auto mb-3 size-10 text-zinc-600" /><p className="text-sm font-bold text-zinc-100">No department teammates yet</p><p className="mt-1 text-sm text-muted-foreground">Ask an admin to assign your employee record to a department.</p></TableCell></TableRow>}
            </TableBody>
          </Table>
          {isLoading && <div className="space-y-3 px-4 py-5">{[0, 1, 2].map((item) => <div className="h-14 animate-pulse rounded-xl bg-white/[0.045]" key={item} />)}</div>}
        </section>
      </div>
    </main>
  );
}
