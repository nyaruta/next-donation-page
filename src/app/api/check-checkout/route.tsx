import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(req: Request) {
  try {
    // Get session_id from the query parameters
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId as string);
    // Return successful response
    return NextResponse.json({
      status: session.payment_status,
      customer_email: session.customer_details.email,
    }, { status: 200 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // Handle errors and return appropriate response
    return NextResponse.json(
      { error: err.message }, 
      { status: err.statusCode || 500 }
    );
  }
}



