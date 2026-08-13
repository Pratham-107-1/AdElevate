import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import AdCard from "../components/ui/AdCard";
import PlanBadge from "../components/ui/PlanBadge";
import { coreApi } from "../api/client";
import { CATEGORY_PILLS } from "../constants/categories";
import useLocations from "../hooks/useLocations";

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const { locations } = useLocations();
  const [category, setCategory] = useState(null); // null = "All"
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = { status: "APPROVED" };
    if (category) params.category = category;
    if (location.trim()) params.city = location.trim();

    Promise.all([
      coreApi.get("/api/ads", { params }),
      coreApi.get("/api/ads/stats"),
    ])
      .then(([adsRes, statsRes]) => {
        if (cancelled) return;
        setAds(adsRes.data);
        setStats(statsRes.data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load ads right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [category, location]);

  // Plan tier order the homepage advertises ("Platinum > Gold > Silver
  // priority") — the ads list itself was never actually sorted by this,
  // so it just showed whatever order the API returned (effectively
  // insertion order), letting an older Gold ad outrank a newer Platinum
  // one. Sort by tier here the same way BrowsePage already does.
  const PLAN_ORDER = { PLATINUM: 0, GOLD: 1, SILVER: 2 };
  const bySearch = search.trim()
    ? ads.filter(
        (ad) =>
          ad.title?.toLowerCase().includes(search.toLowerCase()) ||
          ad.city?.toLowerCase().includes(search.toLowerCase())
      )
    : ads;
  const filtered = [...bySearch].sort(
    (a, b) => (PLAN_ORDER[a.planType?.toUpperCase()] ?? 3) - (PLAN_ORDER[b.planType?.toUpperCase()] ?? 3)
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("keyword", search.trim());
    if (category) params.set("category", category);
    if (location.trim()) params.set("city", location.trim());
    navigate(`/browse?${params.toString()}`);
  };

  const categoryLabel = CATEGORY_PILLS.find((c) => c.value === category)?.label ?? "Featured Ads";

  return (
    <Layout>
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-navy via-sapphire to-[#1a5e82] px-5 pt-18 pb-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-coral/[0.07]" />
          <div className="absolute bottom-[-40px] left-[15%] h-50 w-50 rounded-full bg-white/[0.03]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-coral/35 bg-coral/15 px-4 py-1">
            <span className="text-xs font-bold text-coral">🌟 India's Trusted Business & Service Marketplace</span>
          </div>
          <h1 className="font-heading text-[clamp(28px,5.5vw,56px)] font-black leading-[1.12] text-white mb-4">
            Find Trusted Local Services<br />
            <span className="text-coral">&amp; Businesses Near You</span>
          </h1>
          <p className="mx-auto mb-9 max-w-lg text-base leading-relaxed text-white/70">
            Connect with verified local businesses and service providers. Browse, compare, and contact — all in one place.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto flex max-w-3xl flex-wrap gap-2 rounded-2xl bg-white p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.22)]"
          >
            <div className="flex flex-[2.5] min-w-[200px] items-center gap-2.5 px-3.5">
              <svg width="18" height="18" fill="none" stroke="#FF6F61" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services, shops, products..."
                className="flex-1 border-none bg-transparent text-[15px] text-charcoal outline-none"
              />
            </div>
            <div className="flex min-w-[130px] items-center gap-2 border-l border-slate-200 px-3.5">
              <span className="text-sm">📍</span>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full cursor-pointer border-none bg-transparent text-[14px] text-charcoal outline-none"
              >
                <option value="">Any location</option>
                {locations.map((loc) => (
                  <option key={loc.locationId} value={loc.city}>{loc.city}</option>
                ))}
              </select>
            </div>
            <select
              value={category ?? ""}
              onChange={(e) => setCategory(e.target.value || null)}
              className="cursor-pointer border-l border-slate-200 bg-none pl-3 pr-2 text-[13px] text-slate-500 outline-none"
            >
              {CATEGORY_PILLS.map((c) => (
                <option key={c.label} value={c.value ?? ""}>{c.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="whitespace-nowrap rounded-[10px] bg-coral px-6 py-2.5 font-heading text-[15px] font-extrabold text-white"
            >
              Search
            </button>
          </form>

          {/* Stats */}
          <div className="mt-9 flex flex-wrap justify-center gap-8">
            {stats ? (
              [
                [`${stats.activeAds}+`, "Active Ads"],
                [`${stats.verifiedProviders}+`, "Verified Providers"],
                [stats.categories, "Categories"],
                [stats.avgRating != null ? `${stats.avgRating.toFixed(1)}★` : "New", "Avg Rating"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-heading text-2xl font-extrabold text-coral">{n}</div>
                  <div className="text-xs text-white/55">{l}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-white/40">Loading stats...</div>
            )}
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="border-b border-slate-200 bg-white px-5 py-2.5">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
          {CATEGORY_PILLS.map((c) => {
            const active = category === c.value;
            return (
              <button
                key={c.label}
                onClick={() => setCategory(c.value)}
                className={`whitespace-nowrap rounded-full border px-3.5 py-1 text-[13px] font-medium transition-colors ${
                  active ? "border-navy bg-navy text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured ads */}
      <div className="mx-auto max-w-7xl px-5 py-9">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-[26px] font-extrabold text-navy mb-1">{categoryLabel}</h2>
            <p className="text-sm text-slate-400">
              {loading ? "Loading..." : `${filtered.length} ads`} · Platinum &gt; Gold &gt; Silver priority
            </p>
          </div>
          <div className="flex gap-2.5">
            <PlanBadge plan="PLATINUM" />
            <PlanBadge plan="GOLD" />
            <PlanBadge plan="SILVER" />
          </div>
        </div>

        {error && <p className="text-center text-sm text-brand-red py-10">{error}</p>}

        {!error && (
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(258px, 1fr))" }}>
            {filtered.map((ad) => (
              <AdCard key={ad.adId} ad={ad} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-15 text-center text-slate-400">
            <div className="mb-3 text-5xl">🔍</div>
            <p className="text-base">No ads found. Try a different search or category.</p>
          </div>
        )}
      </div>

      {/* CTA banner */}
      <div className="bg-gradient-to-br from-sapphire to-navy px-5 py-16 text-center">
        <h2 className="font-heading text-3xl font-extrabold text-white mb-3">Grow Your Business with Adelevate</h2>
        <p className="mx-auto mb-7 max-w-md text-[15px] leading-relaxed text-white/65">
          Join {stats?.verifiedProviders ?? "many"}+ businesses reaching thousands of customers daily. Post your first ad today.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate("/register")}
            className="rounded-[10px] bg-coral px-7 py-3 font-heading text-[15px] font-extrabold text-white"
          >
            Post Your Ad Now
          </button>
          <button
            onClick={() => navigate("/plans")}
            className="rounded-[10px] border border-white/30 bg-white/8 px-7 py-3 text-[15px] font-semibold text-white"
          >
            View Pricing Plans
          </button>
        </div>
      </div>
    </Layout>
  );
}
