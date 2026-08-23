import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { coreApi, paymentApi } from "../api/client";

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const adId = searchParams.get("adId");
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null); // { amount, status, planId... } from the already-synced row
  const [ad, setAd] = useState(null);
  // ✅ FIX: fetched from the backend (GET /api/payments/config) instead of
  // being a hardcoded copy here. The backend's razorpay.key is the only
  // source of truth, so the key used to open Checkout can never drift out
  // of sync with the key the backend used to create the order.
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!adId) return;
    Promise.all([
      paymentApi.get(`/api/payments/ad/${adId}`),
      coreApi.get(`/api/ads/${adId}`),
      paymentApi.get(`/api/payments/config`),
    ])
      .then(([paymentRes, adRes, configRes]) => {
        setPayment(paymentRes.data);
        setAd(adRes.data);
        setRazorpayKey(configRes.data.key);
      })
      .catch(() => setError("Could not load order details for this ad."))
      .finally(() => setLoading(false));
  }, [adId]);

  const handlePay = async () => {
    setError(null);
    setPaying(true);
    try {
      // Only adId is sent - amount/vendorId are derived server-side from
      // the ad's subscription plan, never trusted from the client.
      const orderRes = await paymentApi.post("/api/payments", { adId: Number(adId) });
      const order = orderRes.data;

      const options = {
        key: razorpayKey,
        amount: order.amount * 100,
        currency: "INR",
        name: "Adelevate",
        description: "Ad listing payment",
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await paymentApi.post("/api/payments/verify", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              adId: Number(adId),
            });
            navigate(`/success?adId=${adId}`);
          } catch {
            setError("Payment succeeded but verification failed. Contact support with your payment ID.");
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
        theme: { color: "#FF6F61" },
      };

      const rzp = new window.Razorpay(options);

      // ✅ FIX: without this, Razorpay just shows its own generic
      // "Oops! Something went wrong" screen and we never learn why. This
      // surfaces the real reason (declined card, invalid test instrument,
      // amount/currency mismatch, etc.) on our own error banner instead.
      rzp.on("payment.failed", (response) => {
        console.error("Razorpay payment.failed:", response.error);
        setError(
          `Payment failed: ${response.error.description || response.error.reason || "Unknown error"}`
        );
        setPaying(false);
      });

      rzp.open();
    } catch (err) {
      setError(err.response?.data?.error || "Could not start payment. Please try again.");
      setPaying(false);
    }
  };

  if (!adId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-misty">
        <p className="text-slate-400">No ad specified for payment.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-misty p-4">
      <div className="w-full max-w-[500px]">
        <div className="mb-6 text-center">
          <div className="font-heading text-2xl font-black text-navy">
            Adele<span className="text-coral">vate</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Complete Your Payment</p>
        </div>

        {loading && <p className="text-center text-slate-400">Loading order summary...</p>}

        {payment && (
          <div className="mb-4 rounded-2xl border-2 border-platinum-border bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 text-xs text-slate-500">Ad Listing</div>
                <div className="font-heading text-lg font-bold text-navy">{ad?.title || "—"}</div>
              </div>
              <div className="text-right">
                <div className="font-heading text-[30px] font-black text-navy">₹{payment.amount}</div>
                <div className="text-xs text-slate-400">Status: {payment.status}</div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6.5">
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-green-50 p-3">
            <span>🔒</span>
            <span className="text-xs text-green-700">256-bit SSL encrypted · Secure checkout via Razorpay</span>
          </div>

          {error && <p className="mb-4 text-sm text-brand-red">{error}</p>}

          <button
            onClick={handlePay}
            disabled={paying || loading || !payment || !razorpayKey}
            className="w-full rounded-[10px] bg-coral py-3.5 text-base font-black tracking-wide text-white disabled:opacity-60"
          >
            {paying ? "Opening checkout..." : payment ? `Pay ₹${payment.amount} Securely` : "Loading..."}
          </button>
          <button onClick={() => navigate("/provider")} className="mt-3 w-full text-[13px] text-slate-400">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
