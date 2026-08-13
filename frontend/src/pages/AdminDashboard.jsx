import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import PlanBadge from "../components/ui/PlanBadge";
import PieChart from "../components/ui/PieChart";
import { coreApi, paymentApi, resolveImageUrl } from "../api/client";

const TABS = [
  { id: "pending", icon: "⏳", label: "Pending Ads" },
  { id: "users", icon: "👥", label: "Users" },
  { id: "locations", icon: "📍", label: "Locations" },
  { id: "plans", icon: "💼", label: "Plans" },
  { id: "analytics", icon: "📊", label: "Analytics" },
];

function PendingAdsTab() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    coreApi.get("/api/ads", { params: { status: "PENDING_APPROVAL" } })
      .then((res) => setAds(res.data))
      .catch(() => setError("Could not load pending ads."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const act = async (adId, action) => {
    setBusyId(adId);
    setError(null);
    try {
      await coreApi.put(`/api/ads/${adId}/${action}`);
      setAds((prev) => prev.filter((a) => a.adId !== adId));
    } catch (err) {
      setError(err.response?.data || `Could not ${action} this ad.`);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <h2 className="mb-4.5 font-heading text-xl font-bold text-navy">Ads Awaiting Approval</h2>
      {error && <p className="mb-3 text-sm text-brand-red">{typeof error === "string" ? error : "Action failed."}</p>}
      {ads.length === 0 ? (
        <p className="text-slate-400">Nothing pending right now.</p>
      ) : (
        <div className="grid gap-3.5">
          {ads.map((ad) => (
            <div key={ad.adId} className="flex items-center gap-4 rounded-2xl bg-white p-4.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
              {ad.productImage && (
                <img src={resolveImageUrl(ad.productImage)} alt="" className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-navy">{ad.title}</span>
                  <PlanBadge plan={ad.planType} />
                </div>
                <div className="text-[13px] text-slate-500">
                  {ad.category?.replaceAll("_", " ")} · 📍 {ad.city} · {ad.priceRange}
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button
                  disabled={busyId === ad.adId}
                  onClick={() => act(ad.adId, "approve")}
                  className="rounded-lg bg-green-100 px-4 py-1.5 text-[13px] font-bold text-green-700 disabled:opacity-50"
                >
                  ✓ Approve
                </button>
                <button
                  disabled={busyId === ad.adId}
                  onClick={() => act(ad.adId, "reject")}
                  className="rounded-lg bg-red-100 px-4 py-1.5 text-[13px] font-bold text-brand-red disabled:opacity-50"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyEmail, setBusyEmail] = useState(null);

  const load = () => {
    coreApi.get("/api/users")
      .then((res) => setUsers(res.data))
      .catch(() => setError("Could not load users (admin access required)."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggleStatus = async (u) => {
    setBusyEmail(u.email);
    const nextStatus = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await coreApi.put(`/api/users/${u.userId}`, { status: nextStatus });
      setUsers((prev) => prev.map((x) => (x.email === u.email ? { ...x, status: nextStatus } : x)));
    } catch {
      setError("Could not update this user's status.");
    } finally {
      setBusyEmail(null);
    }
  };

  if (loading) return <p className="text-slate-400">Loading...</p>;
  if (error) return <p className="text-brand-red">{error}</p>;

  return (
    <div>
      <h2 className="mb-4.5 font-heading text-xl font-bold text-navy">All Users ({users.length})</h2>
      <div className="overflow-auto rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <table className="w-full" style={{ minWidth: 700 }}>
          <thead>
            <tr className="bg-misty">
              {["Name", "Email", "Phone", "Role", "Status", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.email + i} className="border-t border-slate-100">
                <td className="px-4 py-3 text-sm font-semibold text-navy">{u.name}</td>
                <td className="px-4 py-3 text-[13px] text-slate-500">{u.email}</td>
                <td className="px-4 py-3 text-[13px] text-slate-500">{u.phoneNumber}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${u.status === "ACTIVE" ? "bg-green-50 text-green-600" : "bg-red-50 text-brand-red"}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.role !== "ADMIN" && (
                    <button
                      disabled={busyEmail === u.email}
                      onClick={() => toggleStatus(u)}
                      className={`rounded-md px-3 py-1 text-xs font-bold disabled:opacity-50 ${
                        u.status === "ACTIVE" ? "bg-red-100 text-brand-red" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-400">Admin accounts can't be suspended from here.</p>
    </div>
  );
}

function LocationsTab() {
  const [locations, setLocations] = useState([]);
  const [newCity, setNewCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    coreApi.get("/api/admin/locations")
      .then((res) => setLocations(res.data))
      .catch(() => setError("Could not load locations."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const addLocation = async (e) => {
    e.preventDefault();
    if (!newCity.trim()) return;
    try {
      await coreApi.post("/api/admin/locations", { city: newCity.trim() });
      setNewCity("");
      load();
    } catch {
      setError("Could not add location.");
    }
  };

  const deleteLocation = async (id) => {
    if (!confirm("Delete this location?")) return;
    try {
      await coreApi.delete(`/api/admin/locations/${id}`);
      load();
    } catch {
      setError("Could not delete - it may still be used by an existing ad.");
    }
  };

  return (
    <div>
      <h2 className="mb-4.5 font-heading text-xl font-bold text-navy">Manage Locations</h2>
      <p className="mb-3 text-xs text-slate-400">
        Locations added here appear immediately in the location dropdowns on Home, Browse, and the ad-posting form.
      </p>
      <form onSubmit={addLocation} className="mb-5 flex max-w-sm gap-2">
        <input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Add city..." className="flex-1 rounded-lg border-[1.5px] border-slate-200 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white">Add</button>
      </form>
      {error && <p className="mb-3 text-sm text-brand-red">{error}</p>}
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {locations.map((loc) => (
            <span key={loc.locationId} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] text-slate-600">
              📍 {loc.city}
              <button onClick={() => deleteLocation(loc.locationId)} className="text-brand-red font-bold">✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PlansTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // plan object being edited, or "new"

  const load = () => {
    coreApi.get("/api/subscription-plans")
      .then((res) => setPlans(res.data))
      .catch(() => setError("Could not load plans."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const startNew = () => setEditing({
    planName: "", price: "", duration: "", maxAdsAllowed: "", priorityLevel: "", description: "", isActive: true,
  });

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...editing,
      price: Number(editing.price),
      duration: Number(editing.duration),
      maxAdsAllowed: Number(editing.maxAdsAllowed),
      priorityLevel: Number(editing.priorityLevel),
    };
    try {
      if (editing.planId) {
        await coreApi.put(`/api/subscription-plans/${editing.planId}`, payload);
      } else {
        await coreApi.post("/api/subscription-plans", payload);
      }
      setEditing(null);
      load();
    } catch {
      setError("Could not save this plan.");
    }
  };

  const deletePlan = async (planId) => {
    if (!confirm("Delete this plan?")) return;
    try {
      await coreApi.delete(`/api/subscription-plans/${planId}`);
      load();
    } catch {
      setError("Could not delete - it may still be used by existing ads.");
    }
  };

  return (
    <div>
      <div className="mb-4.5 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-navy">Subscription Plans</h2>
        <button onClick={startNew} className="rounded-lg bg-coral px-4 py-2 text-[13px] font-bold text-white">+ New Plan</button>
      </div>
      {error && <p className="mb-3 text-sm text-brand-red">{error}</p>}

      {editing && (
        <form onSubmit={save} className="mb-5 grid gap-3 rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          <input required placeholder="Plan Name (e.g. GOLD)" value={editing.planName} onChange={(e) => setEditing({ ...editing, planName: e.target.value.toUpperCase() })} className="rounded-lg border-[1.5px] border-slate-200 px-3 py-2 text-sm" />
          <input required type="number" placeholder="Price (₹)" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="rounded-lg border-[1.5px] border-slate-200 px-3 py-2 text-sm" />
          <input required type="number" placeholder="Duration (days)" value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} className="rounded-lg border-[1.5px] border-slate-200 px-3 py-2 text-sm" />
          <input required type="number" placeholder="Max Ads Allowed" value={editing.maxAdsAllowed} onChange={(e) => setEditing({ ...editing, maxAdsAllowed: e.target.value })} className="rounded-lg border-[1.5px] border-slate-200 px-3 py-2 text-sm" />
          <input required type="number" placeholder="Priority Level" value={editing.priorityLevel} onChange={(e) => setEditing({ ...editing, priorityLevel: e.target.value })} className="rounded-lg border-[1.5px] border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Description" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="rounded-lg border-[1.5px] border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
          <div className="flex items-center gap-2 sm:col-span-2">
            <button type="submit" className="rounded-lg bg-navy px-5 py-2 text-sm font-bold text-white">Save Plan</button>
            <button type="button" onClick={() => setEditing(null)} className="text-sm text-slate-500">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {plans.map((plan) => (
            <div key={plan.planId} className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
              <div className="mb-1 flex items-center justify-between">
                <PlanBadge plan={plan.planName} />
                <span className="font-heading text-xl font-black text-navy">₹{plan.price}</span>
              </div>
              <p className="mb-2 text-[13px] text-slate-500">{plan.duration} days · up to {plan.maxAdsAllowed} ad(s)</p>
              {plan.description && <p className="mb-3 text-[13px] text-charcoal">{plan.description}</p>}
              <div className="flex gap-2">
                <button onClick={() => setEditing(plan)} className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Edit</button>
                <button onClick={() => deletePlan(plan.planId)} className="rounded-md bg-red-100 px-3 py-1 text-xs font-bold text-brand-red">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsTab() {
  const [adsByPlan, setAdsByPlan] = useState([]);
  const [revenueByPlan, setRevenueByPlan] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      coreApi.get("/api/ads/stats/by-plan"),
      paymentApi.get("/api/payments/stats/by-plan"),
      coreApi.get("/api/subscription-plans"),
    ])
      .then(([adsRes, revRes, plansRes]) => {
        setAdsByPlan(adsRes.data);
        setRevenueByPlan(revRes.data);
        setPlans(plansRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const planNameById = Object.fromEntries(plans.map((p) => [p.planId, p.planName]));

  const adsData = adsByPlan.map((p) => ({ label: p.planName, value: p.adCount }));
  const revenueData = revenueByPlan.map((p) => ({
    label: planNameById[p.planId] || `Plan #${p.planId}`,
    value: p.totalRevenue,
  }));

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <h2 className="mb-4.5 font-heading text-xl font-bold text-navy">Platform Analytics</h2>
      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <div className="rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <h3 className="mb-4 text-sm font-bold text-navy">Approved Ads by Plan</h3>
          <PieChart data={adsData} valueFormatter={(v) => `${v} ads`} />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <h3 className="mb-4 text-sm font-bold text-navy">Revenue by Plan</h3>
          <PieChart data={revenueData} valueFormatter={(v) => `₹${v?.toLocaleString()}`} />
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Revenue reflects successful payments only. Ad counts reflect currently-approved ads.
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("pending");

  return (
    <Layout>
      <div className="bg-navy px-5 pt-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-5.5 font-heading text-2xl font-extrabold text-white">Admin Dashboard</h1>
          <div className="flex flex-wrap gap-0.5">
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
        {tab === "pending" && <PendingAdsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "locations" && <LocationsTab />}
        {tab === "plans" && <PlansTab />}
        {tab === "analytics" && <AnalyticsTab />}
      </div>
    </Layout>
  );
}
