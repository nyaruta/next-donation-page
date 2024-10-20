import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { amount, currency } = await req.json()
  try {
    let methods: Stripe.Checkout.SessionCreateParams.PaymentMethodType[]
    if (!['CNY', 'HKD'].includes(currency)) {
        methods = ['card', 'link'];
      } else {
        methods = ['card', 'alipay', 'link'];
      }
    const session = await stripe.checkout.sessions.create({
        payment_method_types: methods,
        ui_mode: 'embedded',
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: 'Donation',
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        return_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      })
    return NextResponse.json({ clientSecret: session.client_secret })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}