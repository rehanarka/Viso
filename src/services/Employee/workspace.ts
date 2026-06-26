import { supabase } from "@/lib/supabase";
import { Employee, getEmployeeId } from "@/services/Admin/employee";
import { AttendanceRecord } from "@/services/Admin/workspace";

export type EmployeeProfile = { id: string; company_id: string; full_name: string; email: string; role: "admin" | "manager" | "employee"; status: "active" | "inactive" };
export type EmployeeDepartment = { id: string; name: string; description: string | null; status: "active" | "inactive" };
export type EmployeeCompany = { id: string; name: string; address: string | null; office_latitude: number | null; office_longitude: number | null; allowed_radius_meters: number | null };
export type EmployeeCompanySettings = { face_threshold: number; enable_gps: boolean; enable_face_verification: boolean; enable_snapshot: boolean };
export type OwnFaceEmbedding = { employee_id: string; full_name: string; embedding: number[]; model_name: string; created_at: string };
export type EmployeeWorkspace = { profile: EmployeeProfile; employee: Employee | null; department: EmployeeDepartment | null; peers: Employee[]; attendance: AttendanceRecord[]; company: EmployeeCompany | null; settings: EmployeeCompanySettings | null; faceEmbeddings: OwnFaceEmbedding[] };
export type FaceAttendancePayload = { type: "check_in" | "check_out"; confidence: number; latitude: number | null; longitude: number | null; distance_from_office: number | null };

async function getProfile(): Promise<EmployeeProfile> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error(userError?.message || "You must be signed in.");

  const { data: rpcData } = await supabase.rpc("get_my_profile");
  const rpcProfile = Array.isArray(rpcData) ? rpcData[0] : null;
  if (rpcProfile?.company_id) return rpcProfile as EmployeeProfile;

  const { data, error } = await supabase.from("profiles").select("id, company_id, full_name, email, role, status").eq("id", userData.user.id).limit(1);
  if (error) throw new Error(error.message);
  const profile = data?.[0];
  if (!profile?.company_id) throw new Error("Your profile is not linked to a company.");
  return profile as EmployeeProfile;
}

async function getOwnEmployee(profile: EmployeeProfile): Promise<Employee | null> {
  const { data: byProfile, error: profileError } = await supabase.from("employees").select("*").eq("company_id", profile.company_id).eq("profile_id", profile.id).limit(1);
  if (profileError) throw new Error(profileError.message);
  if (byProfile?.[0]) return byProfile[0] as Employee;

  const { data: byEmail, error: emailError } = await supabase.from("employees").select("*").eq("company_id", profile.company_id).ilike("email", profile.email).limit(1);
  if (emailError) throw new Error(emailError.message);
  return (byEmail?.[0] || null) as Employee | null;
}

async function hydratePositions(companyId: string, employees: Employee[]) {
  const positionIds = [...new Set(employees.map((employee) => employee.position_id).filter(Boolean))] as string[];
  if (positionIds.length === 0) return employees;
  const { data } = await supabase.from("positions").select("id, name").eq("company_id", companyId).in("id", positionIds);
  const positionNames = new Map((data || []).map((position) => [position.id, position.name]));
  return employees.map((employee) => ({ ...employee, position: employee.position_id ? positionNames.get(employee.position_id) || null : null }));
}

export async function getEmployeeWorkspace(): Promise<EmployeeWorkspace> {
  const profile = await getProfile();
  const employee = await getOwnEmployee(profile);
  let department: EmployeeDepartment | null = null;
  let peers: Employee[] = [];
  let attendance: AttendanceRecord[] = [];
  let faceEmbeddings: OwnFaceEmbedding[] = [];

  const [{ data: companyData, error: companyError }, { data: settingsData, error: settingsError }] = await Promise.all([
    supabase.from("companies").select("id, name, address, office_latitude, office_longitude, allowed_radius_meters").eq("id", profile.company_id).limit(1),
    supabase.from("company_settings").select("face_threshold, enable_gps, enable_face_verification, enable_snapshot").eq("company_id", profile.company_id).limit(1),
  ]);

  if (companyError) throw new Error(companyError.message);
  if (settingsError) throw new Error(settingsError.message);

  if (employee?.department_id) {
    const { data: departmentData, error: departmentError } = await supabase.from("departments").select("id, name, description, status").eq("company_id", profile.company_id).eq("id", employee.department_id).limit(1);
    if (departmentError) throw new Error(departmentError.message);
    department = (departmentData?.[0] || null) as EmployeeDepartment | null;

    const { data: peerData, error: peerError } = await supabase.from("employees").select("*").eq("company_id", profile.company_id).eq("department_id", employee.department_id).order("full_name", { ascending: true });
    if (peerError) throw new Error(peerError.message);
    peers = await hydratePositions(profile.company_id, (peerData || []) as Employee[]);
  }

  if (employee) {
    const { data: attendanceData, error: attendanceError } = await supabase.from("attendance_records").select("*").eq("company_id", profile.company_id).eq("employee_id", getEmployeeId(employee)).order("check_time", { ascending: false }).limit(30);
    if (attendanceError) throw new Error(attendanceError.message);
    attendance = (attendanceData || []) as AttendanceRecord[];

    const { data: faceData, error: faceError } = await supabase.rpc("get_my_face_embedding");
    if (!faceError) {
      faceEmbeddings = (Array.isArray(faceData) ? faceData : []).map((face) => ({ ...face, embedding: face.embedding as number[] } as OwnFaceEmbedding));
    }
  }

  const [hydratedEmployee] = employee ? await hydratePositions(profile.company_id, [employee]) : [null];
  return {
    attendance,
    company: (companyData?.[0] || null) as EmployeeCompany | null,
    department,
    employee: hydratedEmployee || null,
    faceEmbeddings,
    peers,
    profile,
    settings: (settingsData?.[0] || null) as EmployeeCompanySettings | null,
  };
}

export async function saveOwnFaceEmbedding(embedding: number[], modelName = "insightface") {
  const { error } = await supabase.rpc("save_my_face_embedding", {
    p_embedding: embedding,
    p_model_name: modelName,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function clearOwnFaceEmbeddings() {
  const { error } = await supabase.rpc("clear_my_face_embeddings");

  if (error) {
    throw new Error(error.message);
  }
}

export async function createFaceAttendance(payload: FaceAttendancePayload) {
  const workspace = await getEmployeeWorkspace();

  if (!workspace.employee || !workspace.company) {
    throw new Error("Employee profile is not ready for attendance.");
  }

  const employeeId = getEmployeeId(workspace.employee);
  const now = new Date();
  const { error } = await supabase.from("attendance_records").insert({
    attendance_date: now.toISOString().slice(0, 10),
    check_time: now.toISOString(),
    company_id: workspace.company.id,
    confidence: payload.confidence,
    distance_from_office: payload.distance_from_office,
    employee_id: employeeId,
    latitude: payload.latitude,
    longitude: payload.longitude,
    notes: "Face verified from employee presence dashboard",
    status: "present",
    type: payload.type,
    verification_method: "face",
  });

  if (error) {
    throw new Error(error.message);
  }
}
