"use client";

import { Building2, CheckCircle2, LocateFixed, MapPin, Search } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Company, getCompany, updateCompany } from "@/services/Admin/workspace";

declare global {
  interface Window {
    L?: any;
  }
}

type LocationForm = { name: string; address: string; office_latitude: string; office_longitude: string; allowed_radius_meters: string };

const defaultLocation = { lat: -6.2, lng: 106.816666 };

function CompanyMapPicker({ form, setForm }: { form: LocationForm; setForm: React.Dispatch<React.SetStateAction<LocationForm>> }) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapError, setMapError] = useState("");

  const lat = Number(form.office_latitude) || defaultLocation.lat;
  const lng = Number(form.office_longitude) || defaultLocation.lng;
  const radius = Number(form.allowed_radius_meters) || 100;

  useEffect(() => {
    if (document.getElementById("leaflet-css")) return;
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (window.L) {
      setMapReady(true);
      return;
    }

    const existingScript = document.getElementById("leaflet-js") as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => setMapReady(true), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapReady(true);
    script.onerror = () => setMapError("Map failed to load. You can still type latitude and longitude manually.");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapEl.current || mapRef.current || !window.L) return;

    const map = window.L.map(mapEl.current, { scrollWheelZoom: true }).setView([lat, lng], 16);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const marker = window.L.marker([lat, lng], { draggable: true }).addTo(map);
    const circle = window.L.circle([lat, lng], { color: "#34d399", fillColor: "#34d399", fillOpacity: 0.08, radius }).addTo(map);

    const syncPoint = (point: { lat: number; lng: number }) => {
      setForm((current) => ({ ...current, office_latitude: point.lat.toFixed(7), office_longitude: point.lng.toFixed(7) }));
    };

    marker.on("dragend", () => syncPoint(marker.getLatLng()));
    map.on("click", (event: any) => {
      marker.setLatLng(event.latlng);
      circle.setLatLng(event.latlng);
      syncPoint(event.latlng);
    });

    mapRef.current = map;
    markerRef.current = marker;
    circleRef.current = circle;
  }, [lat, lng, mapReady, radius, setForm]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !circleRef.current) return;
    const point = [lat, lng] as [number, number];
    markerRef.current.setLatLng(point);
    circleRef.current.setLatLng(point);
    circleRef.current.setRadius(radius);
  }, [lat, lng, radius]);

  const useCurrentLocation = () => {
    setMapError("");
    if (!navigator.geolocation) {
      setMapError("Browser location is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude };
        setForm((current) => ({ ...current, office_latitude: point.lat.toFixed(7), office_longitude: point.lng.toFixed(7) }));
        mapRef.current?.setView([point.lat, point.lng], 17);
      },
      () => setMapError("Location permission was blocked.")
    );
  };

  const searchPlace = async () => {
    const query = searchQuery.trim();
    if (!query) return;
    setMapError("");

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
      const results = await response.json();
      const first = results?.[0];
      if (!first) {
        setMapError("Place not found. Try a more specific address.");
        return;
      }

      const point = { lat: Number(first.lat), lng: Number(first.lon) };
      setForm((current) => ({ ...current, address: current.address || first.display_name, office_latitude: point.lat.toFixed(7), office_longitude: point.lng.toFixed(7) }));
      mapRef.current?.setView([point.lat, point.lng], 17);
    } catch {
      setMapError("Search failed. You can still click the map or type coordinates manually.");
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-card/80 p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-black text-white">Pick office location</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-400">Search an address, click the map, or drag the pin to set the geofence center.</p>
        </div>
        <Button className="h-10 rounded-xl" onClick={useCurrentLocation} type="button" variant="outline"><LocateFixed className="size-4" />Use my location</Button>
      </div>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input className="h-10 bg-background/60 pl-9" onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void searchPlace(); } }} placeholder="Search office address or place name..." value={searchQuery} />
        </div>
        <Button className="h-10 rounded-xl bg-emerald-300 px-4 font-bold text-emerald-950 hover:bg-emerald-200" onClick={() => void searchPlace()} type="button">Find</Button>
      </div>

      {mapError && <p className="mb-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100" role="alert">{mapError}</p>}
      <div className="h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950" ref={mapEl}>
        {!mapReady && <div className="grid h-full place-items-center text-center"><div><MapPin className="mx-auto mb-3 size-8 text-zinc-600" /><p className="text-sm font-semibold text-zinc-200">Loading map</p><p className="mt-1 text-sm text-muted-foreground">Manual coordinate inputs still work.</p></div></div>}
      </div>
      <p className="mt-3 text-xs text-zinc-500">Selected point: {form.office_latitude || "-"}, {form.office_longitude || "-"} · Radius {form.allowed_radius_meters || "100"}m</p>
    </section>
  );
}

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<LocationForm>({ name: "", address: "", office_latitude: "", office_longitude: "", allowed_radius_meters: "100" });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { void getCompany().then((company) => { setCompany(company); setForm({ name: company?.name || "", address: company?.address || "", office_latitude: company?.office_latitude?.toString() || "", office_longitude: company?.office_longitude?.toString() || "", allowed_radius_meters: company?.allowed_radius_meters?.toString() || "100" }); }).catch((error) => setError(error.message)); }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      await updateCompany({ name: form.name, address: form.address || null, office_latitude: form.office_latitude ? Number(form.office_latitude) : null, office_longitude: form.office_longitude ? Number(form.office_longitude) : null, allowed_radius_meters: Number(form.allowed_radius_meters || 100) });
      setCompany(await getCompany());
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Company could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_28%),#09090b] p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-2xl border border-white/10 bg-card/80 p-6"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100"><Building2 className="size-3.5" /> Company</div><h1 className="text-3xl font-black tracking-tight text-white">Company profile</h1><p className="mt-2 text-sm leading-6 text-zinc-400">Set your workplace identity and geofence center for attendance validation.</p></section>
        {error && <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <form className="rounded-2xl border border-white/10 bg-card/80 p-5" onSubmit={submit}>
            <div className="grid gap-4">
              <label className="space-y-2"><span className="text-xs font-semibold text-zinc-300">Company name</span><Input className="h-10 bg-background/60" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} value={form.name} /></label>
              <label className="space-y-2"><span className="text-xs font-semibold text-zinc-300">Address</span><Input className="h-10 bg-background/60" onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} value={form.address} /></label>
              <label className="space-y-2"><span className="text-xs font-semibold text-zinc-300">Allowed radius meters</span><Input className="h-10 bg-background/60" min={10} onChange={(event) => setForm((current) => ({ ...current, allowed_radius_meters: event.target.value }))} type="number" value={form.allowed_radius_meters} /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2"><span className="text-xs font-semibold text-zinc-300">Office latitude</span><Input className="h-10 bg-background/60" onChange={(event) => setForm((current) => ({ ...current, office_latitude: event.target.value }))} placeholder="-6.200000" value={form.office_latitude} /></label>
                <label className="space-y-2"><span className="text-xs font-semibold text-zinc-300">Office longitude</span><Input className="h-10 bg-background/60" onChange={(event) => setForm((current) => ({ ...current, office_longitude: event.target.value }))} placeholder="106.816666" value={form.office_longitude} /></label>
              </div>
              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-4"><p className="flex items-center gap-2 text-sm font-bold text-emerald-100"><MapPin className="size-4" />Geofence rule</p><p className="mt-1 text-sm leading-6 text-zinc-400">Employee face attendance will be rejected when GPS distance is outside this radius.</p></div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" />Current: {company?.name || "Loading company"}</p><Button className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200" disabled={isSaving} type="submit"><CheckCircle2 className="size-4" />{isSaving ? "Saving..." : "Save company"}</Button></div>
          </form>
          <CompanyMapPicker form={form} setForm={setForm} />
          </div>
      </div>
    </main>
  );
}
