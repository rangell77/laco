import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { Monogram } from "@/components/ui";
import { BRAND } from "@/lib/brand";

export function AppHeader({ nome, isAdmin }: { nome: string; isAdmin: boolean }) {
  return (
    <header className="no-print bg-field text-field-ink">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href={isAdmin ? "/admin" : "/painel"} className="flex items-center gap-2">
          <Monogram className="h-7 w-11" />
          <span className="font-display text-3xl">{BRAND.nome}</span>
        </Link>
        <div className="flex items-center gap-2 text-[0.9375rem]">
          <span className="hidden opacity-80 sm:inline">{nome || (isAdmin ? "Administrador" : "Cliente")}</span>
          <form action={signOut}>
            <button className="press min-h-11 px-3 hover:bg-white/10">Sair</button>
          </form>
        </div>
      </div>
    </header>
  );
}
