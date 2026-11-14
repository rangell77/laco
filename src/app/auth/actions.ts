"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const q = encodeURIComponent;

/** Só caminhos internos: bloqueia "//site", "/\site" e esquemas, que os navegadores tratam como outro domínio. */
function isSafePath(p: string) {
  return /^\/(?![\/\\])[^\s]*$/.test(p) && !p.includes("\\");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");
  const safeNext = isSafePath(next) ? next : "/painel";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?erro=${q("E-mail ou senha inválidos.")}&next=${q(safeNext)}`);
  redirect(safeNext);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/definir-senha`,
  });
  redirect(`/login?ok=${q("Se o e-mail estiver cadastrado, enviamos um link para redefinir a senha.")}`);
}

export async function setPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  if (password.length < 8) redirect(`/definir-senha?erro=${q("A senha precisa ter pelo menos 8 caracteres.")}`);
  if (password !== confirm) redirect(`/definir-senha?erro=${q("As senhas não conferem.")}`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error || !data.user) redirect(`/login?erro=${q("Link expirado. Peça um novo convite.")}`);
  if (nome) await supabase.from("profiles").update({ nome }).eq("id", data.user.id);
  redirect("/painel");
}
