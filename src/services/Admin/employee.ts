import { supabase } from "@/lib/supabase";

export type EmployeeStatus = "active" | "inactive" | "resigned";

export type Employee = {
  id?: string;
  employees_id?: string;
  company_id: string;
  profile_id: string | null;
  employee_code: string;
  full_name: string;
  email: string;
  telephone?: string | null;
  address?: string | null;
  gender?: "male" | "female" | null;
  birth_date?: string | null;
  department_id?: string | null;
  position_id?: string | null;
  shift_id?: string | null;
  join_date?: string | null;
  photo_url?: string | null;
  face_registered?: boolean;
  employment_status?: "permanent" | "contract" | "intern";
  position?: string | null;
  division?: string | null;
  department?: string | null;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
};

export type EmployeePayload = {
  full_name: string;
  email: string;
  position: string;
  division: string;
  department_id: string | null;
  status: EmployeeStatus;
};

type CurrentProfile = {
  id: string;
  company_id: string;
  role: string;
};

async function getCurrentProfile(): Promise<CurrentProfile> {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error(userError?.message || "You must be signed in to manage employees.");
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc("get_my_profile");
  const rpcProfile = Array.isArray(rpcData) ? rpcData[0] : null;

  if (rpcProfile?.company_id) {
    return rpcProfile as CurrentProfile;
  }

  if (rpcError && rpcError.code !== "PGRST202") {
    throw new Error(rpcError.message);
  }

  const { data, error } = await supabase.from("profiles").select("id, company_id, role").eq("id", userData.user.id).limit(1);

  const profile = data?.[0];

  if (error) {
    throw new Error(error.message);
  }

  if (!profile) {
    throw new Error(`No profile row found for signed-in user ${userData.user.email || userData.user.id}. Make sure profiles.id matches this auth user id: ${userData.user.id}.`);
  }

  if (!profile.company_id) {
    throw new Error(`Profile found for ${userData.user.email || userData.user.id}, but company_id is empty.`);
  }

  return profile as CurrentProfile;
}

export function getEmployeeId(employee: Pick<Employee, "id" | "employees_id">) {
  return employee.employees_id || employee.id || "";
}

async function ensurePosition(companyId: string, positionName: string) {
  const cleanName = positionName.trim();

  if (!cleanName) {
    return null;
  }

  const { data: existingPositions, error: existingError } = await supabase.from("positions").select("id").eq("company_id", companyId).ilike("name", cleanName).limit(1);

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingPositions?.[0]?.id) {
    return existingPositions[0].id as string;
  }

  const { data, error } = await supabase.from("positions").insert({ company_id: companyId, name: cleanName }).select("id").limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0]?.id || null;
}

export async function getEmployees(): Promise<Employee[]> {
  const profile = await getCurrentProfile();
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_my_employees");
  let employees: Employee[] | null = null;

  if (!rpcError) {
    employees = (rpcData || []) as Employee[];
  } else if (rpcError.code !== "PGRST202") {
    throw new Error(rpcError.message);
  } else {
    const { data, error } = await supabase.from("employees").select("*").eq("company_id", profile.company_id).order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    employees = (data || []) as Employee[];
  }

  const { data: positionsData } = await supabase.from("positions").select("id, name").eq("company_id", profile.company_id);
  const positionNames = new Map((positionsData || []).map((position) => [position.id, position.name]));

  return employees.map((employee) => ({ ...employee, position: employee.position_id ? positionNames.get(employee.position_id) || null : null }));
}

export async function addEmployee(employee: EmployeePayload): Promise<void> {
  const { error } = await supabase.rpc("create_employee_for_my_company", {
    p_department_id: employee.department_id,
    p_email: employee.email,
    p_full_name: employee.full_name,
    p_position_name: employee.position,
    p_status: employee.status,
  });

  if (error) {
    throw new Error(error.message);
  }

}

export async function updateEmployee(employeeId: string, employee: EmployeePayload): Promise<void> {
  const profile = await getCurrentProfile();
  const { full_name, email, status } = employee;
  const position_id = await ensurePosition(profile.company_id, employee.position);
  const updatePayload = { full_name, email, status, department_id: employee.department_id, position_id };
  const byEmployeesId = await supabase.from("employees").update(updatePayload).eq("employees_id", employeeId).eq("company_id", profile.company_id);
  const fallbackError = byEmployeesId.error;

  if (!fallbackError) {
    return;
  }

  if (fallbackError.message.includes("'employees_id'") || fallbackError.message.includes("employees_id")) {
    const { error } = await supabase.from("employees").update(updatePayload).eq("id", employeeId).eq("company_id", profile.company_id);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  throw new Error(fallbackError.message);

}

export async function deleteEmployee(employeeId: string): Promise<void> {
  const profile = await getCurrentProfile();
  const byEmployeesId = await supabase.from("employees").delete().eq("employees_id", employeeId).eq("company_id", profile.company_id);
  const fallbackError = byEmployeesId.error;

  if (!fallbackError) {
    return;
  }

  if (fallbackError.message.includes("'employees_id'") || fallbackError.message.includes("employees_id")) {
    const { error } = await supabase.from("employees").delete().eq("id", employeeId).eq("company_id", profile.company_id);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  throw new Error(fallbackError.message);
}
