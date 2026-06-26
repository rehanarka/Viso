"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Camera, CheckCircle2, Clock3, MapPin, ScanFace, ShieldCheck, UsersRound, VideoOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { registerFaceImage, recognizeOwnFace } from "@/services/Employee/face";
import { clearOwnFaceEmbeddings, createFaceAttendance, EmployeeWorkspace, getEmployeeWorkspace, saveOwnFaceEmbedding } from "@/services/Employee/workspace";

type LocationPayload = { latitude: number; longitude: number };
type PresenceMode = "register" | "check_in" | "check_out";
const FACE_SAMPLE_COUNT = 3;

function captureVideoFrame(video: HTMLVideoElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      reject(new Error("Camera is not ready yet."));
      return;
    }

    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(video, 0, 0, width, height);
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not capture face image."))), "image/jpeg", 0.92);
  });
}

function getCurrentLocation(): Promise<LocationPayload> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("GPS is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => reject(new Error("GPS permission is required for attendance.")),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 12000 }
    );
  });
}

function distanceInMeters(first: LocationPayload, second: LocationPayload) {
  const earthRadius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const deltaLat = toRad(second.latitude - first.latitude);
  const deltaLng = toRad(second.longitude - first.longitude);
  const lat1 = toRad(first.latitude);
  const lat2 = toRad(second.latitude);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function validateFaceQuality(result: { quality?: { face_count: number; brightness: string; sharpness: string } }, label: string) {
  if (!result.quality) return;
  if (result.quality.face_count !== 1) throw new Error(`${label}: exactly one face is required.`);
  if (result.quality.brightness !== "good") throw new Error(`${label}: lighting is ${result.quality.brightness}. Use front-facing, even light.`);
  if (result.quality.sharpness !== "good") throw new Error(`${label}: image is blurry. Hold still and try again.`);
}

export default function EmployeeDashboard() {
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [workspace, setWorkspace] = useState<EmployeeWorkspace | null>(null);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sampleProgress, setSampleProgress] = useState("");
  const [cameraState, setCameraState] = useState<"idle" | "ready" | "blocked">("idle");
  const [presenceModalOpen, setPresenceModalOpen] = useState(false);
  const [presenceMode, setPresenceMode] = useState<PresenceMode>("check_in");
  const [presenceState, setPresenceState] = useState("Ready for verification");
  const today = new Date().toISOString().slice(0, 10);
  const todayRecords = useMemo(() => workspace?.attendance.filter((record) => record.attendance_date === today) || [], [today, workspace]);
  const faceSampleCount = workspace?.faceEmbeddings.length || 0;
  const hasFaceSamples = faceSampleCount > 0;

  useEffect(() => {
    void getEmployeeWorkspace().then(setWorkspace).catch((error) => setError(error.message));
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (!presenceModalOpen) {
      stopCamera();
      setModalError("");
      return;
    }

    const timer = window.setTimeout(() => {
      void startCamera();
    }, 80);

    return () => window.clearTimeout(timer);
  }, [presenceModalOpen]);

  async function startCamera() {
    setModalError("");

    try {
      setCameraState("idle");
      const mediaStream = await navigator.mediaDevices?.getUserMedia({ video: { facingMode: "user" }, audio: false });
      if (!mediaStream) throw new Error("Camera is not supported by this browser.");
      streamRef.current = mediaStream;
      window.requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      });
      setCameraState("ready");
      setPresenceState("Camera ready. Register your face or continue with attendance verification.");
    } catch (error) {
      setCameraState("blocked");
      setModalError(error instanceof Error ? error.message : "Camera permission was blocked. Allow camera access before using face attendance.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState("idle");
  }

  async function reloadWorkspace() {
    setWorkspace(await getEmployeeWorkspace());
  }

  async function handleRegisterFace() {
    setError("");
    setIsProcessing(true);

    try {
      if (!videoRef.current || cameraState !== "ready") throw new Error("Camera must be ready before registering your face.");
      const samples: { embedding: number[]; model: string }[] = [];

      for (let index = 0; index < FACE_SAMPLE_COUNT; index += 1) {
        setSampleProgress(`Capturing sample ${index + 1} of ${FACE_SAMPLE_COUNT}`);
        const image = await captureVideoFrame(videoRef.current);
        const result = await registerFaceImage(image);
        if (!result.success || !result.embedding) throw new Error(result.message || `Face sample ${index + 1} failed.`);
        validateFaceQuality(result, `Sample ${index + 1}`);
        samples.push({ embedding: result.embedding, model: result.model || "insightface" });
        if (index < FACE_SAMPLE_COUNT - 1) await wait(650);
      }

      setSampleProgress("Saving face samples");
      await clearOwnFaceEmbeddings();
      for (const sample of samples) {
        await saveOwnFaceEmbedding(sample.embedding, sample.model);
      }
      await reloadWorkspace();
      setPresenceState(`${samples.length} face samples registered. You can now check in with stronger verification.`);
      setPresenceModalOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Face registration failed.");
    } finally {
      setSampleProgress("");
      setIsProcessing(false);
    }
  }

  async function handlePresence(type: "check_in" | "check_out") {
    setError("");
    setIsProcessing(true);

    try {
      if (!workspace?.employee) throw new Error("Employee record is not linked to this account.");
      if (workspace.faceEmbeddings.length === 0) throw new Error("Register your face before using attendance.");
      if (!videoRef.current || cameraState !== "ready") throw new Error("Camera must be ready before attendance.");

      let location: LocationPayload | null = null;
      let distance: number | null = null;
      const gpsEnabled = workspace.settings?.enable_gps !== false;
      const officeReady = workspace.company?.office_latitude != null && workspace.company?.office_longitude != null;

      if (gpsEnabled) {
        if (!officeReady) throw new Error("Office GPS location is not configured by admin.");
        location = await getCurrentLocation();
        distance = distanceInMeters(location, {
          latitude: Number(workspace.company?.office_latitude),
          longitude: Number(workspace.company?.office_longitude),
        });

        const allowedRadius = workspace.company?.allowed_radius_meters || 100;
        if (distance > allowedRadius) {
          throw new Error(`Attendance rejected. You are ${Math.round(distance)}m from office, outside the allowed ${allowedRadius}m radius.`);
        }
      }

      const image = await captureVideoFrame(videoRef.current);
      const faceResult = await recognizeOwnFace(image, workspace.faceEmbeddings.map((face) => ({ employee_id: face.employee_id, embedding: face.embedding, full_name: face.full_name })));

      const threshold = workspace.settings?.face_threshold || 0.85;
      if (!faceResult.success || !faceResult.matched || (faceResult.confidence || 0) < threshold) {
        throw new Error(`Attendance rejected. Face does not match registered profile${faceResult.confidence ? ` (${Math.round(faceResult.confidence * 100)}%)` : ""}.`);
      }

      await createFaceAttendance({
        confidence: faceResult.confidence || 0,
        distance_from_office: distance,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        type,
      });
      await reloadWorkspace();
      setPresenceState(`${type === "check_in" ? "Check-in" : "Check-out"} accepted. Face and location verified.`);
      setPresenceModalOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Attendance rejected.");
    } finally {
      setIsProcessing(false);
    }
  }

  function openPresenceModal(mode: PresenceMode) {
    setError("");
    setModalError("");
    setPresenceMode(mode);
    setPresenceModalOpen(true);
  }

  async function handleModalSubmit() {
    if (presenceMode === "register") {
      await handleRegisterFace();
      return;
    }

    await handlePresence(presenceMode);
  }

  const modalTitle = presenceMode === "register" ? "Register face" : presenceMode === "check_in" ? "Check in with face" : "Check out with face";
  const modalDescription = presenceMode === "register" ? `Center your face in the frame. Viso will capture ${FACE_SAMPLE_COUNT} quality-checked samples for stronger verification.` : "Keep your face visible. Viso will verify your face and GPS radius before saving attendance.";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.12),transparent_28%),#09090b] p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl">
        {error && <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}

        <motion.section className="mb-6 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(24,24,27,0.94),rgba(11,14,16,0.96))] p-6" initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: "easeOut" as const }}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100"><ShieldCheck className="size-3.5" /> Face presence</div>
              <h1 className="text-3xl font-black tracking-tight text-white">Hi, {workspace?.employee?.full_name || workspace?.profile.full_name || "Employee"}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Dashboard stays clean. Open presence only when you want to register your face or submit attendance.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 text-sm font-black text-emerald-100 transition hover:bg-emerald-300/15" onClick={() => openPresenceModal("register")} type="button"><ScanFace className="size-4" />{hasFaceSamples ? "Update face" : "Register face"}</button>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 text-sm font-black text-emerald-950 transition hover:bg-emerald-200" onClick={() => openPresenceModal("check_in")} type="button"><Camera className="size-4" />Check in</button>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-background/60 px-4 text-sm font-bold text-zinc-100 transition hover:bg-white/[0.04]" onClick={() => openPresenceModal("check_out")} type="button"><Clock3 className="size-4" />Check out</button>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-card/80 p-5"><ScanFace className="mb-4 size-5 text-emerald-200" /><p className="text-sm text-muted-foreground">Registered face</p><p className="mt-2 text-2xl font-black text-white">{hasFaceSamples ? `${faceSampleCount} samples` : "Missing"}</p><p className="mt-1 text-sm text-zinc-500">{hasFaceSamples ? "Best match is used for attendance." : "Register before attendance."}</p></div>
          <div className="rounded-2xl border border-white/10 bg-card/80 p-5"><Clock3 className="mb-4 size-5 text-sky-200" /><p className="text-sm text-muted-foreground">Today records</p><p className="mt-2 text-2xl font-black text-white">{todayRecords.length}</p><p className="mt-1 text-sm text-zinc-500">Check-in and check-out events.</p></div>
          <div className="rounded-2xl border border-white/10 bg-card/80 p-5"><MapPin className="mb-4 size-5 text-amber-200" /><p className="text-sm text-muted-foreground">Office radius</p><p className="mt-2 text-2xl font-black text-white">{workspace?.company?.allowed_radius_meters || 100}m</p><p className="mt-1 text-sm text-zinc-500">Outside radius is rejected.</p></div>
        </div>

        <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">
          <motion.section className="flex min-h-[260px] flex-col rounded-2xl border border-white/10 bg-card/80 p-5" initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: "easeOut" as const }}>
            <div className="flex items-start gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-100"><ShieldCheck className="size-5" /></div>
              <div>
                <h2 className="text-lg font-black text-white">Presence flow</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-400">Click an action above to open camera verification in a modal. Viso checks registered face, GPS radius, and employee account ownership before saving attendance.</p>
              </div>
            </div>
            <div className="mt-auto grid gap-3 pt-5 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><p className="text-xs font-semibold text-zinc-500">1. Camera</p><p className="mt-1 text-sm font-bold text-zinc-100">Opens in modal</p></div>
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><p className="text-xs font-semibold text-zinc-500">2. Identity</p><p className="mt-1 text-sm font-bold text-zinc-100">Face must match</p></div>
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><p className="text-xs font-semibold text-zinc-500">3. Location</p><p className="mt-1 text-sm font-bold text-zinc-100">Radius checked</p></div>
            </div>
          </motion.section>

          <aside className="grid min-h-[260px] gap-4">
            <div className="rounded-2xl border border-white/10 bg-card/80 p-5"><CheckCircle2 className="mb-4 size-5 text-emerald-200" /><p className="text-sm text-muted-foreground">Verification state</p><p className="mt-2 text-base font-bold leading-6 text-white">{isProcessing ? "Processing verification..." : presenceState}</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-card/80 p-5"><UsersRound className="mb-4 size-5 text-violet-200" /><p className="text-sm text-muted-foreground">Department</p><p className="mt-2 text-lg font-bold text-white">{workspace?.department?.name || "Unassigned"}</p><p className="mt-1 text-sm text-zinc-500">{workspace?.peers.length || 0} teammate{workspace?.peers.length === 1 ? "" : "s"}</p></div>
              <div className="rounded-2xl border border-white/10 bg-card/80 p-5"><Camera className="mb-4 size-5 text-sky-200" /><p className="text-sm text-muted-foreground">Camera</p><p className="mt-2 text-lg font-bold text-white">Opens only in modal</p></div>
            </div>
          </aside>
        </div>

        <Dialog open={presenceModalOpen} onOpenChange={setPresenceModalOpen}>
          <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto border border-white/10 bg-[#111113] p-0 text-white sm:max-w-2xl">
            <DialogHeader className="border-b border-white/10 p-5 pr-12">
              <DialogTitle className="text-lg font-black text-white">{modalTitle}</DialogTitle>
              <DialogDescription className="text-sm leading-6 text-zinc-400">{modalDescription}</DialogDescription>
            </DialogHeader>

            <div className="p-5">
              {modalError && <p className="mb-4 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100" role="alert">{modalError}</p>}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                <video ref={videoRef} autoPlay className={cameraState === "ready" ? "aspect-video w-full object-cover" : "hidden"} muted playsInline />
                {cameraState === "blocked" ? (
                  <div className="grid aspect-video place-items-center px-6 text-center"><VideoOff className="mx-auto mb-3 size-10 text-zinc-500" /><p className="text-sm font-semibold text-zinc-200">Camera access blocked</p><p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">Allow camera permission in the browser, then reopen this modal.</p></div>
                ) : cameraState !== "ready" ? (
                  <div className="grid aspect-video place-items-center px-6 text-center"><Camera className="mx-auto mb-3 size-10 text-zinc-600" /><p className="text-sm font-semibold text-zinc-200">Starting camera</p><p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">Your browser may ask for camera permission.</p></div>
                ) : null}
              </div>

              {sampleProgress && <p className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-semibold text-emerald-100">{sampleProgress}</p>}

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><p className="text-xs text-zinc-500">Face</p><p className="mt-1 text-sm font-bold text-zinc-100">{hasFaceSamples || presenceMode === "register" ? "Ready" : "Missing"}</p></div>
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><p className="text-xs text-zinc-500">GPS</p><p className="mt-1 text-sm font-bold text-zinc-100">{workspace?.settings?.enable_gps === false ? "Disabled" : "Required"}</p></div>
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><p className="text-xs text-zinc-500">Radius</p><p className="mt-1 text-sm font-bold text-zinc-100">{workspace?.company?.allowed_radius_meters || 100}m</p></div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button className="h-11 rounded-xl border border-white/10 bg-background/60 px-4 text-sm font-bold text-zinc-100 transition hover:bg-white/[0.04]" onClick={() => setPresenceModalOpen(false)} type="button">Cancel</button>
                <button className="h-11 rounded-xl bg-emerald-300 px-5 text-sm font-black text-emerald-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60" disabled={isProcessing || cameraState !== "ready"} onClick={() => void handleModalSubmit()} type="button">{isProcessing ? "Verifying..." : presenceMode === "register" ? "Save face" : presenceMode === "check_in" ? "Verify check in" : "Verify check out"}</button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
