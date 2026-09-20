import AdminLogin from "@/components/AdminLogin";
import AdminPanel from "@/components/AdminPanel";
import { isAuthenticated } from "@/lib/auth";
import { listExamsSafe, storageDiagnostics } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configured = Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);

  if (!configured) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="card p-6">
          <h1 className="text-xl font-bold">Adminbereich nicht eingerichtet</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Setzen Sie die Umgebungsvariablen <code className="font-mono">ADMIN_PASSWORD</code> und{" "}
            <code className="font-mono">ADMIN_SECRET</code> – lokal in einer Datei{" "}
            <code className="font-mono">.env.local</code>, auf Vercel unter Settings →
            Environment Variables.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-[var(--surface-2)] p-3 text-xs">
{`ADMIN_PASSWORD=ihr-passwort
ADMIN_SECRET=$(openssl rand -hex 32)`}
          </pre>
        </div>
      </div>
    );
  }

  if (!(await isAuthenticated())) {
    return <AdminLogin />;
  }

  const { exams, error } = await listExamsSafe();
  return <AdminPanel initialExams={exams} storage={storageDiagnostics()} loadError={error} />;
}
