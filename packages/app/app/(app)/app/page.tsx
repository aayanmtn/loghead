import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LogheadDashboard } from "@/components/dashboard/loghead-dashboard";

export default async function HomePage() {
  const nextHeaders = await headers();
  const session = await auth.api.getSession({
    headers: new Headers(nextHeaders),
  });

  if (!session) {
    redirect("/app/auth/login");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <main className="flex-1">
        <LogheadDashboard
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image ?? undefined,
          }}
        />
      </main>
    </div>
  );
}
