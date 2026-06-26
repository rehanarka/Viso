"use client";

import { CheckCircle2, Settings } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanySettings, getCompanySettings, upsertCompanySettings } from "@/services/Admin/workspace";

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [form, setForm] = useState({ face_threshold: "0.85", enable_gps: true, enable_face_verification: true, enable_snapshot: true, allow_manual_attendance: true });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { void getCompanySettings().then((settings) => { setSettings(settings); if (settings) setForm({ face_threshold: String(settings.face_threshold), enable_gps: settings.enable_gps, enable_face_verification: settings.enable_face_verification, enable_snapshot: settings.enable_snapshot, allow_manual_attendance: settings.allow_manual_attendance }); }).catch((error) => setError(error.message)); }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      await upsertCompanySettings({ face_threshold: Number(form.face_threshold || 0.85), enable_gps: form.enable_gps, enable_face_verification: form.enable_face_verification, enable_snapshot: form.enable_snapshot, allow_manual_attendance: form.allow_manual_attendance });
      setSettings(await getCompanySettings());
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Settings could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_28%),#09090b] p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-5xl">
        <section className="mb-6 rounded-2xl border border-white/10 bg-card/80 p-6"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100"><Settings className="size-3.5" /> Verification settings</div><h1 className="text-3xl font-black tracking-tight text-white">Company settings</h1><p className="mt-2 text-sm leading-6 text-zinc-400">Control face verification, GPS checks, snapshots, and manual attendance permissions.</p></section>
        {error && <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}
        <form className="rounded-2xl border border-white/10 bg-card/80 p-5" onSubmit={submit}>
          <label className="mb-5 block space-y-2"><span className="text-xs font-semibold text-zinc-300">Face threshold</span><Input className="h-10 max-w-xs bg-background/60" max={1} min={0} onChange={(event) => setForm((current) => ({ ...current, face_threshold: event.target.value }))} step="0.01" type="number" value={form.face_threshold} /></label>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["enable_face_verification", "Enable face verification"],
              ["enable_gps", "Enable GPS geofence"],
              ["enable_snapshot", "Enable attendance snapshot"],
              ["allow_manual_attendance", "Allow manual attendance"],
            ].map(([key, label]) => (
              <label className="flex items-center justify-between rounded-xl border border-white/10 bg-background/50 p-4 text-sm font-semibold text-zinc-100" key={key}>
                {label}
                <input checked={Boolean(form[key as keyof typeof form])} className="size-4 accent-emerald-300" onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.checked }))} type="checkbox" />
              </label>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{settings ? "Settings are configured." : "Settings will be created on save."}</p><Button className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200" disabled={isSaving} type="submit"><CheckCircle2 className="size-4" />{isSaving ? "Saving..." : "Save settings"}</Button></div>
        </form>
      </div>
    </main>
  );
}
