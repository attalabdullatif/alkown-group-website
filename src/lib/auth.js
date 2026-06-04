import { supabase } from "./supabase";

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUserRole(userId) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role, full_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
