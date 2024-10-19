'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SuccessPage() {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Function to get session_id from URL and verify the payment session
  useEffect(() => {
    // Extract session_id from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const session_id = urlParams.get('session_id');
    setSessionId(session_id);

    // Only fetch if session_id exists
    if (session_id) {
      fetch(`/api/check-checkout?session_id=${session_id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch payment session');
          }
          return res.json();
        })
        .then((data) => {
          // Check if payment was successful (Stripe's payment status can be 'paid')
          if (data.status === 'paid') {
            setPaymentStatus('Payment Successful');
          } else {
            setPaymentStatus('Payment Failed or Pending');
          }
        })
        .catch((error) => {
          console.error('Error fetching payment session:', error);
          setPaymentStatus('Error verifying payment');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false); // No session_id, so stop loading
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-100 to-white">
      {loading ? (
        <h1 className="text-2xl font-bold text-green-600">Verifying Payment...</h1>
      ) : (
        <>
          <h1
            className={`text-4xl font-bold mb-8 ${
              paymentStatus === 'Payment Successful' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {paymentStatus === 'Payment Successful'
              ? 'Thank You for Your Donation!'
              : 'Payment Verification Failed'}
          </h1>
          <p className="text-xl mb-8 text-center max-w-md">
            {paymentStatus === 'Payment Successful'
              ? 'Your generous contribution will make a real difference. We appreciate your support!'
              : 'We could not verify your payment. Please try again or contact support.'}
          </p>
          <Link href="/">
            <Button size="lg">Return to Home</Button>
          </Link>
        </>
      )}
    </div>
  );
}
