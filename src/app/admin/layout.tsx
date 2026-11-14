import { AppHeader } from "@/components/app-header";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader nome={profile.nome} isAdmin />
      <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>
    </div>
  );
}
