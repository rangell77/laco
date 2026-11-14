import Link from "next/link";
import { requestPasswordReset, signIn } from "@/app/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Button, Field, Input, Monogram } from "@/components/ui";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; ok?: string; next?: string }>;
}) {
  const { erro, ok, next } = await searchParams;
  return (
    <main className="flex min-h-dvh flex-col bg-field px-3 py-8">
      <Link href="/" className="mx-auto flex items-center gap-2 text-field-ink">
        <Monogram className="h-8 w-12" />
        <span className="font-display text-4xl">{BRAND.nome}</span>
      </Link>
      <div className="card-scallop rise mx-auto mt-10 w-full max-w-md px-6 py-12 sm:px-10">
        <h1 className="font-display text-center text-6xl">Entrar</h1>
        <p className="mt-3 text-center text-muted">Painel da lista de presentes</p>
        <div className="mt-8 flex flex-col gap-5">
          <Alert erro={erro} ok={ok} />
          <form action={signIn} className="flex flex-col gap-5">
            <input type="hidden" name="next" value={next ?? ""} />
            <Field label="E-mail">
              <Input name="email" type="email" autoComplete="email" required />
            </Field>
            <Field label="Senha">
              <Input name="password" type="password" autoComplete="current-password" required />
            </Field>
            <SubmitButton className="mt-1 min-h-12 bg-ink px-5 font-medium text-paper" pendingLabel="Entrando…">
              Entrar
            </SubmitButton>
          </form>
          <details className="text-[0.9375rem]">
            <summary className="cursor-pointer py-2 text-muted hover:text-ink">Esqueci minha senha</summary>
            <form action={requestPasswordReset} className="mt-3 flex flex-col gap-3">
              <Field label="E-mail da conta">
                <Input name="email" type="email" autoComplete="email" required />
              </Field>
              <Button type="submit" variant="ghost">
                Enviar link para redefinir
              </Button>
            </form>
          </details>
        </div>
      </div>
    </main>
  );
}
