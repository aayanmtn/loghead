import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const productId = process.env.STRIPE_PRODUCT_ID;
  if (!productId) {
    return new NextResponse("STRIPE_PRODUCT_ID not configured", { status: 500 });
  }

  try {
    const product = await stripe.products.retrieve(productId);
    const prices = await stripe.prices.list({ product: productId, active: true, limit: 10 });
    const price = prices.data.find((p) => p.recurring?.interval === "month") ?? prices.data[0];

    return NextResponse.json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: price
        ? {
            id: price.id,
            amount: price.unit_amount,
            currency: price.currency,
            interval: price.recurring?.interval ?? null,
          }
        : null,
    });
  } catch (e) {
    console.error("Error fetching product:", e);
    return new NextResponse(String(e), { status: 500 });
  }
}
