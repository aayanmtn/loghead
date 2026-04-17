"use client";

import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/app/auth/login");
      router.refresh(); // ensure server components re-evaluate
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 rounded-full hover:bg-white/10"
      title="Sign out"
    >
      <LogOut size={20} />
    </button>
  );
}
