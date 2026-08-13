import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { coreApi } from "../api/client";
import { PLAN_STYLE } from "../components/ui/PlanBadge";

const BORDER_COLOR = { PLATINUM: "#c4b5fd", GOLD: "#fcd34d", SILVER: "#cbd5e1" };

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    coreApi.get("/api/subscription-plans")
      .then((res) => setPlans(res.data))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...plans].sort((a, b) => (b.priorityLevel ?? 0) - (a.priorityLevel ?? 0));
  const mostPopular = sorted.find((p) => p.planName?.toUpperCase() === "GOLD")?.planId;

  return (
    <Layout>
      <div className="bg-gradient-to-br from-navy to-sapphire px-5 py-14 text-center">
        <h1 className="font-heading text-[clamp(26px,4vw,40px)] font-black text-white mb-3">Simple, Transparent Pricing</h1>
        <p className="mx-auto max-w-lg text-base text-white/65">
          Choose the plan that fits your goals. All plans include admin-verified placement.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-12">
        {loading && <p className="text-center text-slate-400">Loading plans...</p>}

        <div className="grid items-start gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))" }}>
          {sorted.map((plan) => {
            const style = PLAN_STYLE[plan.planName?.toUpperCase()] || {};
            const popular = plan.planId === mostPopular;
            return (
              <div
                key={plan.planId}
                className={`overflow-hidden rounded-[20px] bg-white border-2 ${popular ? "scale-[1.03] shadow-[0_16px_48px_rgba(0,0,0,0.14)]" : "shadow-[0_2px_8px_rgba(0,0,0,0.06)]"}`}
                style={{ borderColor: BORDER_COLOR[plan.planName?.toUpperCase()] || "#e5e7eb" }}
              >
                {popular && (
                  <div className="bg-coral py-1.5 text-center text-xs font-extrabold tracking-wide text-white">
                    ⭐ MOST POPULAR
                  </div>
                )}
                <div className={`px-6 pt-7 pb-4.5 ${style.classes?.split(" ")[1] || "bg-slate-50"}`}>
                  <div className="mb-2.5 text-4xl">{plan.planName?.toUpperCase() === "PLATINUM" ? "💎" : plan.planName?.toUpperCase() === "GOLD" ? "🥇" : "🥈"}</div>
                  <div className={`font-heading text-2xl font-extrabold ${style.classes?.split(" ")[0] || "text-slate-600"}`}>{plan.planName}</div>
                  <div className="mt-1 font-heading text-[38px] font-black text-navy">
                    ₹{plan.price}<span className="text-sm font-normal text-slate-400">/ad</span>
                  </div>
                  <div className="mt-1.5 text-[13px] text-slate-500">{plan.duration} days · up to {plan.maxAdsAllowed} ad(s)</div>
                </div>
                <div className="px-6 py-5.5">
                  {plan.description && (
                    <p className="mb-3.5 text-sm leading-relaxed text-charcoal">{plan.description}</p>
                  )}
                  <button
                    onClick={() => navigate("/register")}
                    className={`mt-4 w-full rounded-[10px] py-3 font-heading text-[15px] font-extrabold text-white ${popular ? "bg-coral" : "bg-navy"}`}
                  >
                    Get Started →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && sorted.length === 0 && (
          <p className="text-center text-slate-400">No subscription plans configured yet.</p>
        )}

        <div className="mt-10 rounded-2xl bg-white px-7 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <h3 className="mb-3.5 text-center font-heading text-[17px] font-bold text-navy">All Plans Include</h3>
          <div className="flex flex-wrap justify-center gap-2.5">
            {["Admin Review & Approval", "Secure Payment Gateway", "Mobile-optimized Listing", "Ratings & Reviews"].map((f) => (
              <span key={f} className="rounded-full border border-slate-200 bg-misty px-3.5 py-1.5 text-[13px] text-slate-600">✓ {f}</span>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
