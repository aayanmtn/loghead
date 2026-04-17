import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getUserTeam } from "@/lib/tenant";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const team = await getUserTeam(session.user.id);
  if (team?.role !== "owner") {
    return NextResponse.json({ error: "Only the team owner can manage billing." }, { status: 403 });
  }
  if (!team?.stripeCustomerId) {
    return new NextResponse("No billing account found", { status: 404 });
  }

  const baseUrl = process.env.BETTER_AUTH_BASE_URL ?? "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${baseUrl}/app`,
  });

  return NextResponse.json({ url: portalSession.url });
}
