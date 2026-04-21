"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { mapAuthError } from "@/lib/mapAuthError";

const AuthPage = () => {
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const [isSignUp, setIsSignUp] = useState(
    searchParams.get("signup") === "true",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        const res = await authClient.signUp.email({
          email,
          password,
          name: email,
        });

        if (res.error) {
          setError(mapAuthError(res.error));
          return;
        }
      } else {
        const res = await authClient.signIn.email({
          email,
          password,
        });

        if (res.error) {
          if (
            res.error.code === "EMAIL_NOT_VERIFIED" ||
            res.error.status === 403
          ) {
            router.push(
              `/app/auth/verify-email?email=${encodeURIComponent(email)}`,
            );
            return;
          }
          setError(mapAuthError(res.error));
          return;
        }
      }

      const inviteId = searchParams.get("invite");
      router.push(inviteId ? `/app/invite/accept?invite=${inviteId}` : "/app");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setError(null);
    setLoading(true);
    const inviteId = searchParams.get("invite");

    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: inviteId
          ? `/app/invite/accept?invite=${inviteId}`
          : "/app",
      });
    } catch {
      setError("GitHub sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      {/* subtle brand glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#00FF9415,transparent_60%)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Loghead
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {isSignUp
              ? "Create an account to start reasoning about your infrastructure."
              : "Sign in to your infra reasoning layer."}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="mb-6 flex rounded-lg border border-zinc-800 p-1">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 rounded-md px-3 py-2 text-sm transition ${
              !isSignUp
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 rounded-md px-3 py-2 text-sm transition ${
              isSignUp
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* GitHub */}
        <div className="space-y-4">
          <button
            onClick={handleGitHubSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:border-[#00FF94]/30 transition"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
              <path d="M12 .5C5.73.5.5 5.74.5 12.04c0 5.1 3.29 9.43 7.86 10.96.57.1.78-.25.78-.56v-2.03c-3.2.7-3.87-1.55-3.87-1.55-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.02 1.76 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.56-.29-5.25-1.29-5.25-5.74 0-1.27.45-2.3 1.18-3.11-.12-.3-.52-1.52.11-3.16 0 0 .97-.31 3.18 1.19a10.9 10.9 0 012.9-.4c.99 0 1.99.13 2.9.4 2.21-1.5 3.18-1.19 3.18-1.19.63 1.64.23 2.86.11 3.16.73.81 1.18 1.84 1.18 3.11 0 4.46-2.69 5.45-5.26 5.74.41.36.78 1.06.78 2.14v3.18c0 .31.21.67.79.56A11.54 11.54 0 0023.5 12.04C23.5 5.74 18.27.5 12 .5z" />
            </svg>
            Continue with GitHub
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-500">or</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-xs text-zinc-500">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00FF94]/40 focus:outline-none"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00FF94]/40 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="text-xs text-zinc-500">Confirm password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-[#00FF94]/40 focus:outline-none"
              />
            </div>
          )}

          {error && <p className="text-center text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#00FF94] px-4 py-2 text-sm font-medium text-black hover:bg-[#00FF94]/90 disabled:opacity-60 transition"
          >
            {loading
              ? isSignUp
                ? "Creating account…"
                : "Signing in…"
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          {isSignUp ? (
            <span>
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-[#00FF94] hover:underline"
              >
                Sign in
              </button>
            </span>
          ) : (
            <span>
              New to Loghead?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-[#00FF94] hover:underline"
              >
                Create an account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
