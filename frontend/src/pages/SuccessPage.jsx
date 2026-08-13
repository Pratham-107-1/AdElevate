import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { coreApi, paymentApi } from "../api/client";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const adId = searchParams.get("adId");
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    if (!adId) return;
    coreApi.get(`/api/ads/${adId}`).then((res) => setAd(res.data)).catch(() => {});
    paymentApi.get(`/api/payments/ad/${adId}`).then((res) => setPayment(res.data)).catch(() => {});
  }, [adId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy to-sapphire p-4">
      <div className="w-full max-w-[480px] rounded-3xl bg-white p-11 text-center shadow-[0_28px_72px_rgba(0,0,0,0.3)]">
        <div className="mx-auto mb-5.5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-4xl shadow-[0_4px_16px_rgba(46,204,113,0.25)]">
          ✅
        </div>
        <h1 className="font-heading text-2xl font-black text-navy mb-3">Payment Successful!</h1>
        <p className="mb-6.5 text-[15px] leading-relaxed text-slate-500">
          {ad ? (
            <>Your <strong>{ad.title}</strong> submission is under admin review. Expect approval within <strong>24 hours</strong>.</>
          ) : (
            "Your ad submission is under admin review."
          )}
        </p>

        <div className="mb-6.5 rounded-xl bg-misty px-5 py-4 text-left">
          {[
            ["Ad Listing", ad?.title || "—"],
            ["Plan", ad?.planType || "—"],
            ["Amount Paid", payment ? `₹${payment.amount}` : "—"],
            ["Status", "⏳ Pending Admin Approval"],
          ].map(([l, v]) => (
            <div key={l} className="mb-2.5 flex justify-between">
              <span className="text-[13px] text-slate-400">{l}</span>
              <span className="text-[13px] font-bold text-navy">{v}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/provider")}
          className="mb-2.5 w-full rounded-[10px] bg-coral py-3.5 font-heading text-[15px] font-extrabold text-white"
        >
          Go to Dashboard
        </button>
        <button onClick={() => navigate("/")} className="w-full text-[13px] text-slate-400">
          Back to Home
        </button>
      </div>
    </div>
  );
}
