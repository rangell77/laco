import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EventFull } from "@/lib/types";

export type Profile = { id: string; nome: string; email: string | null; papel: "admin" | "cliente" };

/** Usuário logado + perfil, ou null. */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nome, email, papel")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile) return null;
  return { supabase, user, profile };
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile.papel !== "admin") redirect("/painel");
  return session;
}

/** Garante acesso ao evento (admin ou membro). O RLS também protege. */
export async function requireEventAccess(eventId: string) {
  const session = await requireUser();
  const { data: event } = await session.supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle<EventFull>();
  if (!event) redirect("/painel");
  return { ...session, event };
}
