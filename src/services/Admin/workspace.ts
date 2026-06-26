import { supabase } from "@/lib/supabase";
import { Employee } from "@/services/Admin/employee";

export type Company = { id: string; name: string; logo_url: string | null; address: string | null; office_latitude: number | null; office_longitude: number | null; allowed_radius_meters: number | null; created_at: string; updated_at: string };
export type CompanySettings = { id: string; company_id: string; face_threshold: number; enable_gps: boolean; enable_face_verification: boolean; enable_snapshot: boolean; allow_manual_attendance: boolean; created_at: string; updated_at: string };
export type Shift = { id: string; company_id: string; name: string; start_time: string; end_time: string; late_tolerance_minutes: number; work_days: string[]; status: "active" | "inactive"; created_at: string; updated_at: string };
export type ShiftPayload = { name: string; start_time: string; end_time: string; late_tolerance_minutes: number; status: "active" | "inactive" };
export type AttendanceRecord = { id: string; company_id: string; employee_id: string; type: "check_in" | "check_out"; attendance_date: string; check_time: string; status: "present" | "late" | "absent" | "sick" | "leave"; confidence: number | null; latitude: number | null; longitude: number | null; distance_from_office: number | null; snapshot_url: string | null; verification_method: "face" | "manual" | "qr" | "gps"; notes: string | null; created_at: string; employees?: Pick<Employee, "full_name" | "employee_code" | "email"> | null };
export type ManualAttendancePayload = { employee_id: string; type: "check_in" | "check_out"; attendance_date: string; check_time: string; status: "present" | "late" | "absent" | "sick" | "leave"; notes: string };

type CurrentProfile = { id: string; company_id: string; role: string };

export async function getCurrentProfile(): Promise<CurrentProfile> {
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_my_profile");
  const rpcProfile = Array.isArray(rpcData) ? rpcData[0] : null;
  if (rpcProfile?.company_id) return rpcProfile as CurrentProfile;
  if (rpcError && rpcError.code !== "PGRST202") throw new Error(rpcError.message);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error(userError?.message || "You must be signed in.");

  const { data, error } = await supabase.from("profiles").select("id, company_id, role").eq("id", userData.user.id).limit(1);
  if (error) throw new Error(error.message);
  const profile = data?.[0];
  if (!profile?.company_id) throw new Error("Profile is not linked to a company.");
  return profile as CurrentProfile;
}

export async function getCompany(): Promise<Company | null> {
  const profile = await getCurrentProfile();
  const { data, error } = await supabase.from("companies").select("*").eq("id", profile.company_id).limit(1);
  if (error) throw new Error(error.message);
  return (data?.[0] || null) as Company | null;
}

export async function updateCompany(payload: Partial<Pick<Company, "name" | "address" | "office_latitude" | "office_longitude" | "allowed_radius_meters">>) {
  const profile = await getCurrentProfile();
  const { error } = await supabase.from("companies").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", profile.company_id);
  if (error) throw new Error(error.message);
}

export async function getCompanySettings(): Promise<CompanySettings | null> {
  const profile = await getCurrentProfile();
  const { data, error } = await supabase.from("company_settings").select("*").eq("company_id", profile.company_id).limit(1);
  if (error) throw new Error(error.message);
  return (data?.[0] || null) as CompanySettings | null;
}

export async function upsertCompanySettings(payload: Partial<Pick<CompanySettings, "face_threshold" | "enable_gps" | "enable_face_verification" | "enable_snapshot" | "allow_manual_attendance">>) {
  const profile = await getCurrentProfile();
  const { error } = await supabase.from("company_settings").upsert({ company_id: profile.company_id, ...payload, updated_at: new Date().toISOString() }, { onConflict: "company_id" });
  if (error) throw new Error(error.message);
}

export async function getShifts(): Promise<Shift[]> {
  const profile = await getCurrentProfile();
  const { data, error } = await supabase.from("shifts").select("*").eq("company_id", profile.company_id).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as Shift[];
}

export async function addShift(payload: ShiftPayload) {
  const profile = await getCurrentProfile();
  const { error } = await supabase.from("shifts").insert({ ...payload, company_id: profile.company_id });
  if (error) throw new Error(error.message);
}

export async function updateShift(shiftId: string, payload: ShiftPayload) {
  const profile = await getCurrentProfile();
  const { error } = await supabase.from("shifts").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", shiftId).eq("company_id", profile.company_id);
  if (error) throw new Error(error.message);
}

export async function deleteShift(shiftId: string) {
  const profile = await getCurrentProfile();
  const { error } = await supabase.from("shifts").delete().eq("id", shiftId).eq("company_id", profile.company_id);
  if (error) throw new Error(error.message);
}

export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  const profile = await getCurrentProfile();
  const { data, error } = await supabase.from("attendance_records").select("*, employees(full_name, employee_code, email)").eq("company_id", profile.company_id).order("check_time", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as AttendanceRecord[];
}

export async function addManualAttendance(payload: ManualAttendancePayload) {
  const profile = await getCurrentProfile();
  const checkTime = new Date(payload.check_time);
  const { error } = await supabase.from("attendance_records").insert({
    attendance_date: payload.attendance_date,
    check_time: Number.isNaN(checkTime.getTime()) ? new Date().toISOString() : checkTime.toISOString(),
    company_id: profile.company_id,
    employee_id: payload.employee_id,
    notes: payload.notes.trim() || null,
    status: payload.status,
    type: payload.type,
    verification_method: "manual",
  });
  if (error) throw new Error(error.message);
}
