import {supabase} from "@/lib/supabase";

export async function signUp(email: string, password: string, fullName: string, company: string) {
    const {data, error} = await supabase.auth.signUp({
        email,
        password,
    })
    if (error){
        throw new Error(error.message);
    }
    return {data, error};
}