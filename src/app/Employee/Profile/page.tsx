"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, BriefcaseBusiness, Mail, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmployeeWorkspace, getEmployeeWorkspace } from "@/services/Employee/workspace";

function getInitials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">{label}</p><p className="mt-2 text-sm font-semibold text-zinc-100">{value || "-"}</p></div>;
}

export default function EmployeeProfilePage() {
  const shouldReduceMotion = useReducedMotion();
  const [workspace, setWorkspace] = useState<EmployeeWorkspace | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void getEmployeeWorkspace().then(setWorkspace).catch((error) => setError(error.message));
  }, []);

  const name = workspace?.employee?.full_name || workspace?.profile.full_name || "Employee";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_28%),#09090b] p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <motion.section className="mb-6 rounded-2xl border border-white/10 bg-card/80 p-6" initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100"><UserRound className="size-3.5" /> Profile</div>
          <h1 className="text-3xl font-black tracking-tight text-white">Employee profile</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Confirm your account, employee identity, department, and presence readiness.</p>
        </motion.section>

        {error && <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-white/10 bg-card/80 p-6">
            <Avatar className="size-20 border border-white/10" size="lg"><AvatarFallback className="bg-emerald-300/10 text-xl font-black text-emerald-100">{getInitials(name)}</AvatarFallback></Avatar>
            <h2 className="mt-5 text-2xl font-black text-white">{name}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Mail className="size-4" />{workspace?.employee?.email || workspace?.profile.email || "-"}</p>
            <div className="mt-5 flex flex-wrap gap-2"><Badge className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100" variant="outline">{workspace?.profile.role || "employee"}</Badge><Badge className="border-white/10 bg-white/[0.04] text-zinc-200" variant="outline">{workspace?.employee?.status || workspace?.profile.status || "active"}</Badge></div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card/80 p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-bold text-zinc-100"><BriefcaseBusiness className="size-4 text-emerald-200" />Employment details</div>
            <div className="grid gap-3 md:grid-cols-2">
              <Detail label="Employee code" value={workspace?.employee?.employee_code || ""} />
              <Detail label="Position" value={workspace?.employee?.position || ""} />
              <Detail label="Department" value={workspace?.department?.name || "Unassigned"} />
              <Detail label="Employment" value={workspace?.employee?.employment_status || ""} />
              <Detail label="Join date" value={workspace?.employee?.join_date || ""} />
              <Detail label="Face registered" value={workspace?.employee?.face_registered ? "Ready" : "Not registered"} />
            </div>
            <div className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-4"><p className="flex items-center gap-2 text-sm font-bold text-emerald-100"><BadgeCheck className="size-4" />Account link</p><p className="mt-1 text-sm leading-6 text-zinc-400">{workspace?.employee ? "Your auth account is connected to an employee record." : "Your auth profile exists, but no employee record was found for this email yet."}</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
