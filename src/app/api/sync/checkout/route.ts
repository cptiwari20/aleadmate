import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

export async function POST() {
  const env = getServerEnv();

  return NextResponse.json(
    {
      status: "not_configured",
      message: env.STRIPE_SECRET_KEY
        ? "Stripe key detected. Implement checkout session creation in this route next."
        : "Stripe checkout is scaffolded. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PRICE_ID_SYNC_MONTHLY to enable $5/month sync billing.",
    },
    { status: 501 },
  );
}
