"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function InviteAcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteId = searchParams.get("invite");

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const [status, setStatus] = useState<
    "checking" | "accepting" | "success" | "error"
  >("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteId) {
      setErrorMessage("No invite ID provided.");
      setStatus("error");
      return;
    }

    if (isSessionLoading) return;

    if (!session) {
      // Redirect to login, preserving invite
      router.push(`/app/auth/login?invite=${inviteId}`);
      return;
    }

    if (!session.user.emailVerified) {
      router.push(
        `/app/auth/verify-email?email=${encodeURIComponent(session.user.email)}`,
      );
      return;
    }

    const acceptInvite = async () => {
      setStatus("accepting");
      try {
        const res = await fetch("/api/team/invite/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to accept invite");
        }

        setStatus("success");
        setTimeout(() => {
          router.push("/app");
        }, 2000);
      } catch (err: any) {
        console.error("Invite acceptance error:", err);
        setErrorMessage(err.message || "An error occurred");
        setStatus("error");
      }
    };

    acceptInvite();
  }, [inviteId, session, isSessionLoading, router]);

  if (status === "checking" || status === "accepting") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-zinc-400">
            {status === "checking"
              ? "Checking session..."
              : "Accepting invite..."}
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <h1 className="text-2xl font-bold">Invite Accepted!</h1>
          <p className="text-zinc-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="flex flex-col items-center gap-4 text-center">
        <XCircle className="h-12 w-12 text-red-500" />
        <h1 className="text-2xl font-bold">Invalid Invite</h1>
        <p className="text-zinc-400 max-w-sm">
          {errorMessage ||
            "The invite link is invalid or has expired. Please ask for a new invite."}
        </p>
        <button
          onClick={() => router.push("/app")}
          className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-zinc-400">Loading invite...</p>
          </div>
        </div>
      }
    >
      <InviteAcceptContent />
    </Suspense>
  );
}
