import { supabase } from "@/lib/supabase";

export type DepartmentStatus = "active" | "inactive";

export type Department = {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  status: DepartmentStatus;
  created_at: string;
  updated_at: string;
};

export type DepartmentPayload = {
  name: string;
  description: string;
  status: DepartmentStatus;
};

export async function getDepartments(): Promise<Department[]> {
  const { data, error } = await supabase.rpc("get_my_departments");

  if (error?.code === "PGRST202") {
    const { data: profileData, error: profileError } = await supabase.rpc("get_my_profile");
    const profile = Array.isArray(profileData) ? profileData[0] : null;

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile?.company_id) {
      throw new Error("Profile is not linked to a company.");
    }

    const { data: fallbackData, error: fallbackError } = await supabase.from("departments").select("*").eq("company_id", profile.company_id).order("created_at", { ascending: false });

    if (fallbackError) {
      throw new Error(fallbackError.message);
    }

    return (fallbackData || []) as Department[];
  }

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Department[];
}

export async function addDepartment(department: DepartmentPayload): Promise<void> {
  const { error } = await supabase.rpc("create_department_for_my_company", {
    p_description: department.description,
    p_name: department.name,
    p_status: department.status,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateDepartment(departmentId: string, department: DepartmentPayload): Promise<void> {
  const { error } = await supabase.rpc("update_department_for_my_company", {
    p_department_id: departmentId,
    p_description: department.description,
    p_name: department.name,
    p_status: department.status,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteDepartment(departmentId: string): Promise<void> {
  const { error } = await supabase.rpc("delete_department_for_my_company", {
    p_department_id: departmentId,
  });

  if (error) {
    throw new Error(error.message);
  }
}
