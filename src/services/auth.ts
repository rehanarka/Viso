import { supabase } from "@/lib/supabase";

export type SignedInProfile = {
  id: string;
  company_id: string;
  role: "admin" | "manager" | "employee";
};

export async function signUp(email: string, password: string, fullName: string, company: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || "Registrasi gagal di Supabase Auth");
  }

  let user = data.user;
  let session = data.session;

  if (!session) {
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      throw new Error(loginError.message);
    }

    user = loginData.user;
    session = loginData.session;
  }

  if (!user || !session) {
    throw new Error("User gagal login setelah registrasi");
  }

  const { error: onboardingError } = await supabase.rpc(
    "create_company_with_admin",
    {
      company_name: company,
      full_name: fullName,
      user_email: email,
    }
  );

  if (onboardingError) {
    throw new Error(onboardingError.message);
  }

  return { data, error };
}

export async function signIn(email: string, password: string){
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    if (error){
        throw new Error(error.message || "Login Failed");
    }
    return { data, error };
}

export async function claimEmployeeProfile(fullName?: string) {
  const { error } = await supabase.rpc("claim_employee_profile", {
    p_full_name: fullName || null,
  });

  if (error) {
    throw new Error(error.message || "Employee profile could not be linked");
  }
}

export async function getSignedInProfile(): Promise<SignedInProfile | null> {
  const { data, error } = await supabase.rpc("get_my_profile");

  if (error) {
    return null;
  }

  const profile = Array.isArray(data) ? data[0] : null;
  return profile || null;
}

export async function activateEmployeeAccount(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || "Employee account could not be created");
  }

  let session = data.session;

  if (!session) {
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      throw new Error(loginError.message);
    }

    session = loginData.session;
  }

  if (!session) {
    throw new Error("Account created. Please confirm your email, then sign in again.");
  }

  await claimEmployeeProfile(fullName);

  return data;
}
