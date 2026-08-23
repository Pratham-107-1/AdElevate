import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PlanBadge from "../components/ui/PlanBadge";
import ProductImagePicker from "../components/ui/ProductImagePicker";
import { coreApi, paymentApi, resolveImageUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ALL_CATEGORIES } from "../constants/categories";
import useLocations from "../hooks/useLocations";
import PieChart from "../components/ui/PieChart";

const TABS = [
  { id: "myads", icon: "📋", label: "My Ads" },
  { id: "postad", icon: "➕", label: "Post Ad" },
  { id: "plans", icon: "💼", label: "Plans" },
  { id: "payments", icon: "💳", label: "Payments" },
  { id: "analytics", icon: "📊", label: "Analytics" },
];

function EditAdModal({ ad, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: ad.title || "",
    city: ad.city || "",
    minPrice: ad.minPrice ?? "",
    maxPrice: ad.maxPrice ?? "",
    category: ad.category || "",
    description: ad.description || "",
    productImage: ad.productImage || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { locations } = useLocations();

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.title || !form.city || !form.category || !form.minPrice || !form.maxPrice) {
      setError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await coreApi.put(`/api/ads/${ad.adId}`, {
        title: form.title,
        city: form.city,
        category: form.category,
        description: form.description,
        productImage: form.productImage,
        minPrice: Number(form.minPrice),
        maxPrice: Number(form.maxPrice),
        // vendorId, planId, and expirationDate deliberately omitted —
        // those aren't editable here and the backend now leaves an
        // omitted expirationDate untouched instead of nulling it out.
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Could not update ad.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-7 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-navy">Edit Ad Details</h3>
          <button onClick={onClose} className="text-xl leading-none text-slate-400">×</button>
        </div>

        <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Ad Title</label>
        <input value={form.title} onChange={update("title")} className="mb-4 w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm" />

        <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Location (City)</label>
        <select value={form.city} onChange={update("city")} className="mb-4 w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm">
          <option value="">Select a city</option>
          {locations.map((loc) => <option key={loc.locationId} value={loc.city}>{loc.city}</option>)}
        </select>

        <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Price Range</label>
        <div className="mb-4 flex gap-2">
          <input value={form.minPrice} onChange={update("minPrice")} type="number" placeholder="Min ₹" className="w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm" />
          <input value={form.maxPrice} onChange={update("maxPrice")} type="number" placeholder="Max ₹" className="w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm" />
        </div>

        <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Category</label>
        <select value={form.category} onChange={update("category")} className="mb-4 w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm">
          <option value="">Select a category</option>
          {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c.replaceAll("_", " ")}</option>)}
        </select>

        <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Description</label>
        <textarea value={form.description} onChange={update("description")} rows={4}
          className="mb-4 w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm" />

        <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Image</label>
        <ProductImagePicker value={form.productImage} onChange={(url) => setForm((f) => ({ ...f, productImage: url }))} />

        {error && <p className="mt-3 text-sm text-brand-red">{error}</p>}

        <div className="mt-5.5 flex gap-3">
          <button onClick={save} disabled={saving} className="rounded-[10px] bg-coral px-7 py-2.5 text-sm font-extrabold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button onClick={onClose} disabled={saving} className="text-[13px] text-slate-500">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function MyAdsTab({ ads, loading, onGoPost, onRefresh, onPay }) {
  const [editingAd, setEditingAd] = useState(null);

  const deleteAd = async (adId) => {
    if (!confirm("Delete this ad?")) return;
    try {
      await coreApi.delete(`/api/ads/${adId}`);
      onRefresh();
    } catch (err) {
      // Previously a failed delete request threw here with nothing
      // downstream to catch it — the ad just silently stayed in the list
      // with no explanation. Surface the real reason instead.
      alert(err.response?.data?.error || "Could not delete this ad.");
    }
  };

  return (
    <div>
      <div className="mb-4.5 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-navy">My Advertisements</h2>
        <button onClick={onGoPost} className="rounded-lg bg-coral px-4.5 py-2 text-[13px] font-bold text-white">+ Post New Ad</button>
      </div>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : ads.length === 0 ? (
        <p className="text-slate-400">You haven't posted any ads yet.</p>
      ) : (
        <div className="overflow-auto rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <table className="w-full" style={{ minWidth: 860 }}>
            <thead>
              <tr className="bg-misty">
                {["Ad Title", "Category", "Description", "Plan", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ads.map((ad, i) => (
                <tr key={ad.adId} className={`border-t border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {ad.productImage && (
                        <img src={resolveImageUrl(ad.productImage)} alt="" className="h-10.5 w-10.5 rounded-lg object-cover" style={{ height: 42, width: 42 }} />
                      )}
                      <span className="font-bold text-navy text-sm">{ad.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-slate-500">{ad.category?.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3.5 text-[13px] text-slate-500 max-w-[220px]">
                    <span className="line-clamp-2">{ad.description || "—"}</span>
                  </td>
                  <td className="px-4 py-3.5"><PlanBadge plan={ad.planType} /></td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      ad.status === "PENDING_PAYMENT" || ad.status === "PAYMENT_FAILED"
                        ? "bg-amber-50 text-amber-600"
                        : ad.status === "REJECTED"
                        ? "bg-red-50 text-brand-red"
                        : "bg-green-50 text-green-600"
                    }`}>{ad.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2">
                      {/* ✅ FIX: this was the only way an ad ever reached
                          /payment?adId=X — right after posting, via
                          PostAdTab's onPosted. If the vendor cancelled,
                          closed the tab, or the payment failed, the ad was
                          stuck at PENDING_PAYMENT / PAYMENT_FAILED forever
                          with no way back to the payment page. */}
                      {(ad.status === "PENDING_PAYMENT" || ad.status === "PAYMENT_FAILED") && (
                        <button onClick={() => onPay(ad.adId)} className="rounded-md bg-coral px-2.5 py-1 text-xs font-bold text-white">Pay Now</button>
                      )}
                      <button onClick={() => setEditingAd(ad)} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-navy">Edit</button>
                      <button onClick={() => deleteAd(ad.adId)} className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold text-brand-red">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editingAd && (
        <EditAdModal
          ad={editingAd}
          onClose={() => setEditingAd(null)}
          onSaved={() => { setEditingAd(null); onRefresh(); }}
        />
      )}
    </div>
  );
}

function PostAdTab({ vendorId, onPosted }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", city: "", minPrice: "", maxPrice: "", category: "", description: "", productImage: "" });
  const [plans, setPlans] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { locations } = useLocations();

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (step === 2) {
      coreApi.get("/api/subscription-plans").then((res) => setPlans(res.data));
    }
  }, [step]);

  const goStep2 = () => {
    if (!form.title || !form.city || !form.category || !form.minPrice || !form.maxPrice) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const selectPlan = async (planId) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await coreApi.post("/api/ads", {
        title: form.title,
        city: form.city,
        category: form.category,
        description: form.description,
        productImage: form.productImage,
        minPrice: Number(form.minPrice),
        maxPrice: Number(form.maxPrice),
        expirationDate: defaultExpirationDate(),
        vendorId,
        planId,
      });
      onPosted(res.data.adId);
    } catch (err) {
      setError(err.response?.data?.error || "Could not create ad.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="mb-2 font-heading text-xl font-bold text-navy">Post a New Ad</h2>
      <div className="mb-7 flex items-center gap-1">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold text-white ${step >= s ? "bg-coral" : "bg-slate-200"}`}>
              {step > s ? "✓" : s}
            </div>
            <span className={`text-xs font-semibold ${step >= s ? "text-coral" : "text-slate-400"}`}>{["Ad Details", "Select Plan", "Payment"][s - 1]}</span>
            {s < 3 && <div className={`mr-1 h-px w-9 ${step > s ? "bg-coral" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="rounded-2xl bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Ad Title</label>
          <input value={form.title} onChange={update("title")} placeholder="What is your business called?" className="mb-4 w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm" />

          <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Location (City)</label>
          <select value={form.city} onChange={update("city")} className="mb-4 w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm">
            <option value="">Select a city</option>
            {locations.map((loc) => <option key={loc.locationId} value={loc.city}>{loc.city}</option>)}
          </select>

          <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Price Range</label>
          <div className="mb-4 flex gap-2">
            <input value={form.minPrice} onChange={update("minPrice")} type="number" placeholder="Min ₹" className="w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm" />
            <input value={form.maxPrice} onChange={update("maxPrice")} type="number" placeholder="Max ₹" className="w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm" />
          </div>

          <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Category</label>
          <select value={form.category} onChange={update("category")} className="mb-4 w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm">
            <option value="">Select a category</option>
            {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c.replaceAll("_", " ")}</option>)}
          </select>

          <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Description</label>
          <textarea value={form.description} onChange={update("description")} placeholder="Describe your business, products, or services..." rows={4}
            className="mb-4 w-full rounded-[10px] border-[1.5px] border-slate-200 px-3.5 py-2.5 text-sm" />

          <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">Select Image</label>
          <ProductImagePicker value={form.productImage} onChange={(url) => setForm((f) => ({ ...f, productImage: url }))} />

          {error && <p className="mt-3 text-sm text-brand-red">{error}</p>}
          <button onClick={goStep2} className="mt-5.5 rounded-[10px] bg-coral px-7 py-2.5 text-sm font-extrabold text-white">Next: Select Plan →</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="grid gap-3.5">
            {plans.map((plan) => (
              <button
                key={plan.planId}
                disabled={submitting}
                onClick={() => selectPlan(plan.planId)}
                className="flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-transform"
              >
                <div className="text-3xl">{plan.planName?.toUpperCase() === "PLATINUM" ? "💎" : plan.planName?.toUpperCase() === "GOLD" ? "🥇" : "🥈"}</div>
                <div className="flex-1">
                  <div className="font-heading text-lg font-extrabold text-navy">{plan.planName}</div>
                  <div className="text-[13px] text-slate-500">{plan.duration} days · up to {plan.maxAdsAllowed} ad(s)</div>
                </div>
                <div className="text-right">
                  <div className="font-heading text-2xl font-black text-navy">₹{plan.price}</div>
                  <div className="text-xs text-slate-400">per ad</div>
                </div>
              </button>
            ))}
          </div>
          {error && <p className="mt-3 text-sm text-brand-red">{error}</p>}
          {submitting && <p className="mt-3 text-sm text-slate-400">Creating your ad...</p>}
          <button onClick={() => setStep(1)} disabled={submitting} className="mt-4 text-[13px] text-slate-500">← Back to details</button>
        </div>
      )}
    </div>
  );
}

function PaymentsTab({ vendorId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentApi.get(`/api/payments/vendor/${vendorId}`)
      .then((res) => setPayments(res.data))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [vendorId]);

  return (
    <div>
      <h2 className="mb-5 font-heading text-xl font-bold text-navy">Payment History</h2>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : payments.length === 0 ? (
        <p className="text-slate-400">No payments yet.</p>
      ) : (
        <div className="overflow-auto rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <table className="w-full" style={{ minWidth: 560 }}>
            <thead>
              <tr className="bg-misty">
                {["Ad ID", "Amount", "Status", "Created"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.paymentId} className="border-t border-slate-100">
                  <td className="px-4 py-3.5 text-sm font-semibold text-navy">#{p.adId}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-sapphire">₹{p.amount}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${p.status === "SUCCESS" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-slate-500">{p.createdAt?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AnalyticsTab({ ads }) {
  // Honest, real numbers only - no click/enquiry tracking exists in the
  // backend yet, so those metrics (shown in the Figma mock) are omitted
  // rather than fabricated.
  const approved = ads.filter((a) => a.status === "APPROVED").length;
  const pending = ads.filter((a) => a.status === "PENDING_APPROVAL" || a.status === "PENDING_PAYMENT").length;
  const avgRating = ads.filter((a) => a.averageRating != null);
  const avg = avgRating.length ? (avgRating.reduce((s, a) => s + a.averageRating, 0) / avgRating.length).toFixed(1) : null;

  const metrics = [
    { label: "Total Ads", value: ads.length, icon: "📋" },
    { label: "Approved", value: approved, icon: "✅" },
    { label: "Pending", value: pending, icon: "⏳" },
    { label: "Avg Rating", value: avg ? `${avg} ★` : "No ratings yet", icon: "⭐" },
  ];

  const statusData = Object.entries(
    ads.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {})
  ).map(([label, value]) => ({ label, value }));

  const planData = Object.entries(
    ads.reduce((acc, a) => { const p = a.planType || "Unknown"; acc[p] = (acc[p] || 0) + 1; return acc; }, {})
  ).map(([label, value]) => ({ label, value }));

  return (
    <div>
      <h2 className="mb-5 font-heading text-xl font-bold text-navy">Ad Performance</h2>
      <div className="mb-6 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="mb-2 text-2xl">{m.icon}</div>
            <div className="font-heading text-[22px] font-extrabold text-navy">{m.value}</div>
            <div className="text-[13px] text-slate-500">{m.label}</div>
          </div>
        ))}
      </div>

      {ads.length > 0 && (
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div className="rounded-xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <h3 className="mb-4 text-sm font-bold text-navy">Ads by Status</h3>
            <PieChart data={statusData} size={150} />
          </div>
          <div className="rounded-xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <h3 className="mb-4 text-sm font-bold text-navy">Ads by Plan</h3>
            <PieChart data={planData} size={150} />
          </div>
        </div>
      )}
      <p className="mt-5 text-xs text-slate-400">
        Click/enquiry tracking isn't built yet, so those metrics aren't shown here.
      </p>
    </div>
  );
}

export default function ProviderDashboard() {
  const [tab, setTab] = useState("myads");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId, email } = useAuth();
  const navigate = useNavigate();

  const loadAds = () => {
    setLoading(true);
    // Filtered client-side since there's no vendor-scoped ads endpoint yet -
    // fine at this dataset size, worth a real endpoint later.
    coreApi.get("/api/ads")
      .then((res) => setAds(res.data.filter((a) => a.vendorId === userId)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAds(); }, [userId]);

  return (
    <Layout>
      <div className="bg-navy px-5 pt-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-white mb-1">Provider Dashboard</h1>
              <p className="text-[13px] text-white/55">Welcome back, {email} 👋</p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-[10px] bg-white/8 px-4 py-2 text-center">
                <div className="font-heading text-lg font-extrabold text-coral">{ads.length}</div>
                <div className="text-[11px] text-white/50">My Ads</div>
              </div>
            </div>
          </div>
          <div className="flex gap-0.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-t-lg px-4.5 py-2.5 text-[13px] font-bold ${
                  tab === t.id ? "bg-white text-navy" : "bg-transparent text-white/65"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-7">
        {tab === "myads" && <MyAdsTab ads={ads} loading={loading} onGoPost={() => setTab("postad")} onRefresh={loadAds} onPay={(adId) => navigate(`/payment?adId=${adId}`)} />}
        {tab === "postad" && <PostAdTab vendorId={userId} onPosted={(adId) => navigate(`/payment?adId=${adId}`)} />}
        {tab === "plans" && (
          <div>
            <h2 className="mb-2 font-heading text-xl font-bold text-navy">Subscription Plans</h2>
            <p className="mb-4 text-sm text-slate-500">See full plan details and pricing on the Plans page.</p>
            <Link to="/plans" className="inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-bold text-white">View Plans →</Link>
          </div>
        )}
        {tab === "payments" && <PaymentsTab vendorId={userId} />}
        {tab === "analytics" && <AnalyticsTab ads={ads} />}
      </div>
    </Layout>
  );
}

function defaultExpirationDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}
