import { setPassword } from "@/app/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input, Monogram } from "@/components/ui";

export const metadata = { title: "Criar senha" };

export default async function DefinirSenhaPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="flex min-h-dvh flex-col bg-field px-3 py-10">
      <div className="card-scallop rise mx-auto w-full max-w-md px-6 py-12 sm:px-10">
        <Monogram className="mx-auto h-9 w-14" />
        <h1 className="font-display mt-4 text-center text-6xl">Crie sua senha</h1>
        <p className="mt-3 text-center text-muted">Você vai usar ela para entrar no painel da sua lista.</p>
        <div className="mt-8 flex flex-col gap-5">
          <Alert erro={erro} />
          <form action={setPassword} className="flex flex-col gap-5">
            <Field label="Seu nome">
              <Input name="nome" autoComplete="name" />
            </Field>
            <Field label="Senha" hint="Mínimo de 8 caracteres">
              <Input name="password" type="password" autoComplete="new-password" minLength={8} required />
            </Field>
            <Field label="Confirmar senha">
              <Input name="confirm" type="password" autoComplete="new-password" minLength={8} required />
            </Field>
            <SubmitButton className="mt-1 min-h-12 bg-ink px-5 font-medium text-paper" pendingLabel="Salvando…">
              Salvar e entrar
            </SubmitButton>
          </form>
        </div>
      </div>
    </main>
  );
}
