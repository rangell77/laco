import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com a service role: IGNORA o RLS.
 * Usar apenas em Server Actions / rotas do servidor, para as ações do
 * convidado (criar contribuição, "Já paguei"), sempre validando a entrada.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
