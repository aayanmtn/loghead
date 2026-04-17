"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  User,
  Users,
  CreditCard,
  Plug,
  LogOut,
  Upload,
  Mail,
  Plus,
  Minus,
  Check,
  Loader2,
  ExternalLink,
  Receipt,
  Sparkles,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type Section = "profile" | "team" | "billing" | "integrations";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User size={15} /> },
  { id: "team", label: "Team", icon: <Users size={15} /> },
  { id: "billing", label: "Billing", icon: <CreditCard size={15} /> },
  { id: "integrations", label: "Integrations", icon: <Plug size={15} /> },
];

// ── Profile Section ──────────────────────────────────────────────────────────
function ProfileSection({ user }: { user: SettingsModalProps["user"] }) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [avatarSrc, setAvatarSrc] = useState<string>(
    user.image || `https://avatar.vercel.sh/${user.id}`,
  );
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5MB.");
      return;
    }

    setAvatarUploading(true);
    setAvatarError(null);
    // Optimistic preview using object URL
    const previewUrl = URL.createObjectURL(file);
    setAvatarSrc(previewUrl);
    e.target.value = "";

    try {
      // Upload file to server — returns a plain URL, not base64
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Upload failed");
      }

      // Save the URL (tiny string) to the user record
      const { error } = await authClient.updateUser({ image: json.url });
      if (error) {
        throw new Error(error.message ?? "Failed to save photo.");
      }

      setAvatarSrc(json.url);
      router.refresh();
    } catch (err: any) {
      setAvatarError(err.message ?? "Failed to upload photo.");
      setAvatarSrc(user.image || `https://avatar.vercel.sh/${user.id}`);
    } finally {
      URL.revokeObjectURL(previewUrl);
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const { error } = await authClient.updateUser({ name });
    setSaving(false);
    if (error) {
      setSaveError(error.message ?? "Failed to save.");
    } else {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/app/auth/login");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">Profile</h2>
        <p className="text-xs text-zinc-500">
          Manage your personal information.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <img
            src={avatarSrc}
            alt="avatar"
            className={`h-16 w-16 rounded-full border border-zinc-700 object-cover transition-opacity ${avatarUploading ? "opacity-40" : "opacity-100"}`}
            onError={() => setAvatarSrc(`https://avatar.vercel.sh/${user.id}`)}
          />
          {/* Loading spinner overlay */}
          {avatarUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full">
              <Loader2 size={20} className="text-white animate-spin" />
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={avatarUploading}
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 transition-colors disabled:cursor-not-allowed"
            title="Change photo"
          >
            <Upload size={10} className="text-zinc-300" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-zinc-500">{user.email}</p>
          {avatarUploading && (
            <p className="text-xs text-zinc-400 mt-1">Uploading photo...</p>
          )}
          {avatarError && (
            <p className="text-xs text-red-400 mt-1">{avatarError}</p>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
            />
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-2 pl-8 text-sm text-zinc-500 cursor-not-allowed select-none"
            />
          </div>
          <p className="text-xs text-zinc-600 mt-1">Email cannot be changed.</p>
        </div>
      </div>

      {saveError && <p className="text-xs text-red-400 -mt-4">{saveError}</p>}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {saved && <Check size={13} />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

// ── Team Section ─────────────────────────────────────────────────────────────
type TeamMember = {
  id: string;
  role: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
};
type TeamInvite = {
  id: string;
  email: string;
  name: string;
  status: string;
  createdAt: string;
};

function TeamSection({
  user,
  onNavigateToBilling,
}: {
  user: SettingsModalProps["user"];
  onNavigateToBilling: () => void;
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState(false);

  const [hasPro, setHasPro] = useState(false);
  const [totalSeats, setTotalSeats] = useState(0);
  const [userRole, setUserRole] = useState<string>("member");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmMemberId, setConfirmMemberId] = useState<string | null>(null);

  const isOwner = userRole === "owner";
  const usedSeats = members.length + invites.length;

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team/members");
      if (res.ok) {
        const data = await res.json();
        setHasPro(data.hasPro);
        setTotalSeats(data.totalSeats);
        setUserRole(data.userRole ?? "member");
        setMembers(data.members ?? []);
        setInvites(data.invites ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleInvite = async () => {
    setInviteLoading(true);
    setInviteError(null);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName.trim(),
          email: inviteEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error ?? "Failed to send invite.");
        return;
      }
      setInviteSent(true);
      setInviteName("");
      setInviteEmail("");
      await loadMembers();
      setTimeout(() => {
        setInviteSent(false);
        setShowInvite(false);
      }, 2000);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemoving(memberId);
    try {
      await fetch("/api/team/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      await loadMembers();
    } finally {
      setRemoving(null);
      setConfirmMemberId(null);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    setRemoving(inviteId);
    try {
      await fetch("/api/team/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });
      await loadMembers();
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">Team</h2>
        <p className="text-xs text-zinc-500">Manage members and invitations.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-24">
          <Loader2 size={18} className="text-zinc-500 animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          {/* No Pro callout — only shown to owner */}
          {isOwner && !hasPro && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
              <Sparkles
                size={16}
                className="text-emerald-400 mt-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white mb-1">
                  Loghead Pro required
                </p>
                <p className="text-xs text-zinc-400 mb-3">
                  Upgrade to Loghead Pro to invite team members and collaborate
                  on your workspace.
                </p>
                <button
                  onClick={onNavigateToBilling}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  <CreditCard size={12} />
                  View plans
                </button>
              </div>
            </div>
          )}

          {/* Seat usage bar */}
          {isOwner && hasPro && totalSeats > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Seats used</span>
                <span className="font-medium text-zinc-300">
                  {usedSeats} / {totalSeats}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${Math.min((usedSeats / totalSeats) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Members list */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Members
            </p>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 divide-y divide-zinc-800">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        member.image ||
                        `https://avatar.vercel.sh/${member.userId}`
                      }
                      alt={member.name}
                      className="h-8 w-8 rounded-full border border-zinc-700 object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          `https://avatar.vercel.sh/${member.userId}`;
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.name}
                        {member.userId === user.id && (
                          <span className="text-zinc-500 font-normal">
                            {" "}
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        member.role === "owner"
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-zinc-400 bg-zinc-700/50"
                      }`}
                    >
                      {member.role === "owner" ? "Owner" : "Member"}
                    </span>
                    {isOwner && member.role !== "owner" && (
                      <button
                        onClick={() => setConfirmMemberId(member.id)}
                        disabled={removing === member.id}
                        className="p-1 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40"
                        title="Remove member"
                      >
                        {removing === member.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Pending invite rows */}
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center shrink-0">
                      <Mail size={13} className="text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {invite.name}
                      </p>
                      <p className="text-xs text-zinc-500">{invite.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleRevokeInvite(invite.id)}
                        disabled={removing === invite.id}
                        className="p-1 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40"
                        title="Revoke invite"
                      >
                        {removing === invite.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite button — owner only, Pro only, seats available */}
          {isOwner && hasPro && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowInvite(true);
                  setInviteError(null);
                }}
                disabled={usedSeats >= totalSeats}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
                title={
                  usedSeats >= totalSeats ? "No seats remaining" : undefined
                }
              >
                <Plus size={13} />
                Invite member
              </button>
            </div>
          )}

          {/* Invite form */}
          {showInvite && (
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 space-y-3">
              <p className="text-sm font-semibold text-white">
                Invite a team member
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
              {inviteError && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle size={12} />
                  {inviteError}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => {
                    setShowInvite(false);
                    setInviteName("");
                    setInviteEmail("");
                    setInviteError(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={
                    !inviteName.trim() || !inviteEmail.trim() || inviteLoading
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  {inviteLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : inviteSent ? (
                    <Check size={13} />
                  ) : null}
                  {inviteLoading
                    ? "Sending…"
                    : inviteSent
                      ? "Invite sent!"
                      : "Send invite"}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {confirmMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-semibold text-white mb-2">
              Remove team member
            </h3>

            <p className="text-xs text-zinc-400 mb-5">
              Are you sure you want to remove this member from the team? They
              will lose access to the workspace.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmMemberId(null)}
                className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => handleRemoveMember(confirmMemberId)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
                disabled={removing === confirmMemberId}
              >
                {removing === confirmMemberId ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Billing Section ───────────────────────────────────────────────────────────
type ProductData = {
  id: string;
  name: string;
  description: string | null;
  price: {
    id: string;
    amount: number;
    currency: string;
    interval: string | null;
  } | null;
};

type SubscriptionData = {
  id: string;
  status: string;
  billingCycleAnchor: number;
  cancelAt: number | null;
  cancelAtPeriodEnd: boolean;
  items: {
    id: string;
    productName: string | null;
    priceAmount: number | null;
    priceCurrency: string;
    interval: string | null;
    quantity: number;
  }[];
};

type InvoiceData = {
  id: string;
  number: string | null;
  status: string | null;
  amountPaid: number;
  currency: string;
  created: number;
  hostedInvoiceUrl: string | null;
  periodStart: number;
  periodEnd: number;
};

function formatCurrency(amount: number | null, currency: string) {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BillingSection() {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("member");

  const [seatDraft, setSeatDraft] = useState<number | null>(null);
  const [seatLoading, setSeatLoading] = useState(false);
  const [seatError, setSeatError] = useState<string | null>(null);
  const [seatSaved, setSeatSaved] = useState(false);

  const currentSeats = subscription?.items[0]?.quantity ?? 1;
  const isOwner = userRole === "owner";

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productRes, subRes, teamRes] = await Promise.all([
        fetch("/api/billing/product"),
        fetch("/api/billing/subscription"),
        fetch("/api/team/members"),
      ]);

      if (!productRes.ok) throw new Error("Failed to load product info");
      if (!subRes.ok) throw new Error("Failed to load subscription info");

      const productData = await productRes.json();
      const subData = await subRes.json();
      const teamData = teamRes.ok ? await teamRes.json() : null;

      setProduct(productData);
      setSubscription(subData.subscription ?? null);
      setInvoices(subData.invoices ?? []);
      if (teamData?.userRole) setUserRole(teamData.userRole);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateSeats = async () => {
    if (seatDraft === null || seatDraft === currentSeats) return;
    setSeatLoading(true);
    setSeatError(null);
    try {
      const res = await fetch("/api/billing/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: seatDraft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSeatError(data.error ?? "Failed to update seats.");
        return;
      }
      setSeatSaved(true);
      setSeatDraft(null);
      await loadData();
      setTimeout(() => setSeatSaved(false), 2000);
    } finally {
      setSeatLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!product?.price?.id) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: product.price.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">Billing</h2>
        <p className="text-xs text-zinc-500">
          Manage your subscription and payment details.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={20} className="text-zinc-500 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && !isOwner && (
        <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-5 flex items-start gap-3">
          <AlertCircle size={16} className="text-zinc-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white mb-1">
              Owner access required
            </p>
            <p className="text-xs text-zinc-400">
              Only the team owner can view and manage billing details. Contact
              your team owner to make changes to the subscription.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && isOwner && (
        <>
          {/* No active subscription — show plan CTA */}
          {!subscription && product && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={15} className="text-emerald-400" />
                    <span className="text-sm font-semibold text-white">
                      {product.name}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-xs text-zinc-400">
                      {product.description}
                    </p>
                  )}
                </div>
                {product.price && (
                  <div className="text-right shrink-0">
                    <span className="text-xl font-bold text-white">
                      {formatCurrency(
                        product.price.amount,
                        product.price.currency,
                      )}
                    </span>
                    {product.price.interval && (
                      <span className="text-xs text-zinc-500 ml-1">
                        / {product.price.interval}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || !product.price}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                {checkoutLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CreditCard size={14} />
                )}
                {checkoutLoading ? "Redirecting to Stripe…" : "Subscribe now"}
              </button>
            </div>
          )}

          {/* Active subscription */}
          {subscription && (
            <div className="space-y-4">
              {/* Plan card */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Current plan
                  </p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      subscription.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : subscription.status === "trialing"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {subscription.status.charAt(0).toUpperCase() +
                      subscription.status.slice(1)}
                  </span>
                </div>

                {subscription.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-400" />
                      <span className="text-sm font-medium text-white">
                        Loghead Pro
                      </span>
                      {item.interval && (
                        <span className="text-xs text-zinc-500">
                          / {item.interval}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-white">
                        {formatCurrency(
                          item.priceAmount !== null
                            ? item.priceAmount * (seatDraft ?? item.quantity)
                            : null,
                          item.priceCurrency,
                        )}
                      </span>
                      {/* Seat stepper */}
                      <div className="flex items-center gap-1.5 mt-1 justify-end">
                        <button
                          onClick={() => {
                            setSeatDraft(
                              Math.max(1, (seatDraft ?? item.quantity) - 1),
                            );
                            setSeatError(null);
                          }}
                          className="h-5 w-5 flex items-center justify-center rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-xs font-medium text-zinc-300 w-14 text-center">
                          {seatDraft ?? item.quantity}{" "}
                          {(seatDraft ?? item.quantity) === 1
                            ? "seat"
                            : "seats"}
                        </span>
                        <button
                          onClick={() => {
                            setSeatDraft((seatDraft ?? item.quantity) + 1);
                            setSeatError(null);
                          }}
                          className="h-5 w-5 flex items-center justify-center rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-3 pb-0 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    {subscription.cancelAt ? "Cancels on " : "Next billing "}
                    <span className="text-zinc-300">
                      {formatDate(
                        subscription.cancelAt ??
                          subscription.billingCycleAnchor,
                      )}
                    </span>
                    {subscription.cancelAtPeriodEnd && (
                      <span className="text-yellow-400 font-medium ml-2">
                        Cancellation scheduled
                      </span>
                    )}
                  </span>
                  {seatDraft !== null && seatDraft !== currentSeats ? (
                    <div className="flex items-center gap-1.5">
                      {seatError && (
                        <span className="flex items-center gap-1 text-red-400">
                          <AlertCircle size={10} />
                          {seatError}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSeatDraft(null);
                          setSeatError(null);
                        }}
                        className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateSeats}
                        disabled={seatLoading}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium transition-colors"
                      >
                        {seatLoading ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : seatSaved ? (
                          <Check size={10} />
                        ) : null}
                        {seatLoading
                          ? "Updating…"
                          : seatSaved
                            ? "Updated!"
                            : `Update to ${seatDraft} ${seatDraft === 1 ? "seat" : "seats"}`}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-50 text-zinc-300 text-xs font-medium transition-colors"
                >
                  {portalLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <ExternalLink size={12} />
                  )}
                  Manage subscription
                </button>
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/10 disabled:opacity-50 text-red-400 text-xs font-medium transition-colors"
                >
                  {portalLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : null}
                  Cancel subscription
                </button>
              </div>
            </div>
          )}

          {/* Payment history */}
          {invoices.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Payment history
              </p>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 divide-y divide-zinc-800">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between px-4 py-3 gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Receipt size={13} className="text-zinc-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {formatDate(inv.periodStart)} –{" "}
                          {formatDate(inv.periodEnd)}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {inv.number ?? inv.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-white">
                        {formatCurrency(inv.amountPaid, inv.currency)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          inv.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : inv.status === "open"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-zinc-700 text-zinc-400"
                        }`}
                      >
                        {inv.status ?? "—"}
                      </span>
                      {inv.hostedInvoiceUrl && (
                        <a
                          href={inv.hostedInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-500 hover:text-zinc-300 transition-colors"
                          title="View invoice"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No invoices yet (subscribed but no payments yet) */}
          {subscription && invoices.length === 0 && (
            <div className="rounded-lg border border-dashed border-zinc-800 px-4 py-6 text-center text-xs text-zinc-600">
              No payment history yet.
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Integrations Section ──────────────────────────────────────────────────────
const INTEGRATIONS = [
  {
    id: "aws",
    name: "Amazon Web Services",
    description: "Stream logs from Lambda, ECS, and CloudWatch.",
    logo: "/integrations/aws.webp",
    border: "border-[#FF9900]/20 hover:border-[#FF9900]/40",
    bg: "bg-white",
  },
  {
    id: "gcp",
    name: "Google Cloud",
    description: "Connect to GCP Logging, Cloud Run, and Pub/Sub.",
    logo: "/integrations/gcp.png",
    border: "border-[#4285F4]/20 hover:border-[#4285F4]/40",
    bg: "bg-white",
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Ingest logs from Vercel deployments and edge functions.",
    logo: "/integrations/vercel.png",
    border: "border-zinc-600 hover:border-zinc-400",
    bg: "bg-white",
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    description: "Pull logs from Azure Monitor, Functions, and AKS.",
    logo: "/integrations/azure.png",
    border: "border-[#0089D6]/20 hover:border-[#0089D6]/40",
    bg: "bg-white",
  },
];

function IntegrationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">
          Integrations
        </h2>
        <p className="text-xs text-zinc-500">
          Connect Loghead to your cloud infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {INTEGRATIONS.map((integration) => {
          return (
            <div
              key={integration.id}
              className={`flex items-center justify-between rounded-lg border bg-zinc-900/50 px-4 py-3.5 transition-colors ${integration.border}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${integration.bg}`}
                >
                  <img
                    src={integration.logo}
                    alt={integration.name}
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {integration.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {integration.description}
                  </p>
                </div>
              </div>
              <span className="shrink-0 ml-4 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-default">
                Coming soon
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<Section>("profile");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex h-[580px] w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Sidebar */}
        <aside className="flex w-52 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/60 p-3">
          <div className="mb-4 px-2 pt-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Settings
            </p>
          </div>
          <nav className="flex flex-col gap-0.5 flex-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left ${
                  activeSection === item.id
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-7">
          {activeSection === "profile" && <ProfileSection user={user} />}
          {activeSection === "team" && (
            <TeamSection
              user={user}
              onNavigateToBilling={() => setActiveSection("billing")}
            />
          )}
          {activeSection === "billing" && <BillingSection />}
          {activeSection === "integrations" && <IntegrationsSection />}
        </main>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
