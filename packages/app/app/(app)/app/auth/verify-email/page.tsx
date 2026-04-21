"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user?.emailVerified) {
      router.push("/app");
    }
  }, [session, router]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      setMessage({
        text: "No email address found. Please try logging in again.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/app",
      });

      if (res.error) {
        setMessage({
          text: res.error.message || "Failed to resend verification email.",
          type: "error",
        });
      } else {
        setMessage({
          text: "Verification email sent! Please check your inbox.",
          type: "success",
        });
        setCooldown(30);
      }
    } catch (err) {
      setMessage({ text: "An unexpected error occurred.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      {/* subtle brand glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#00FF9415,transparent_60%)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50 border border-zinc-700/50">
          <Mail className="h-8 w-8 text-[#00FF94]" />
        </div>

        <h1 className="text-xl font-bold text-white tracking-tight mb-2">
          Verify your email
        </h1>

        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          We sent a verification link to{" "}
          {email ? (
            <span className="font-medium text-white">{email}</span>
          ) : (
            "your email address"
          )}
          . Please check your inbox and click the link to continue.
        </p>

        {message && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm text-left ${
              message.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={loading || cooldown > 0 || !email}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#00FF94] px-4 py-2 text-sm font-medium text-black hover:bg-[#00FF94]/90 disabled:opacity-60 transition mb-4"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          {cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend Verification Email"}
        </button>

        <div className="mt-6">
          <Link
            href="/app/auth/login"
            className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
