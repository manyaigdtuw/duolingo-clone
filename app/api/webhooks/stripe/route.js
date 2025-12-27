import { headers } from "next/headers";
import { NextResponse } from "next/server";

import db from "@/db/index";
import { stripe } from "@/lib/stripe";

export async function POST(req) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return new NextResponse(`Webhook error ${JSON.stringify(error)}`, {
      status: 400,
    });
  }

  const session = event.data.object;

  // user subscription completed
  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription
    );

    if (!session?.metadata?.userId)
      return new NextResponse("User id is required.", { status: 400 });

    await db.query(
      `INSERT INTO user_subscription (
        user_id,
        stripe_subscription_id,
        stripe_customer_id,
        stripe_price_id,
        stripe_current_period_end
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        session.metadata.userId,
        subscription.id,
        subscription.customer,
        subscription.items.data[0].price.id,
        new Date(subscription.current_period_end * 1000), // in ms
      ]
    );
  }

  // renew user subscription
  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription
    );

    await db.query(
      `UPDATE user_subscription
       SET stripe_price_id = $1, stripe_current_period_end = $2
       WHERE stripe_subscription_id = $3`,
      [
        subscription.items.data[0].price.id,
        new Date(subscription.current_period_end * 1000), // in ms
        subscription.id,
      ]
    );
  }

  return new NextResponse(null, { status: 200 });
}
