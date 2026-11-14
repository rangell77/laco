import { AppHeader } from "@/components/app-header";
import { requireUser } from "@/lib/auth";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader nome={profile.nome} isAdmin={profile.papel === "admin"} />
      <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>
    </div>
  );
}
