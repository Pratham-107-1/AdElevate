import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import AdCard from "../components/ui/AdCard";
import { coreApi } from "../api/client";
import { CATEGORY_PILLS } from "../constants/categories";
import useLocations from "../hooks/useLocations";

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || null;
  const city = searchParams.get("city") || "";

  const [searchInput, setSearchInput] = useState(keyword);
  const [locationInput, setLocationInput] = useState(city);
  const { locations } = useLocations();
  const [planFilter, setPlanFilter] = useState("All");
  const [sort, setSort] = useState("tier");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { status: "APPROVED" };
    if (category) params.category = category;
    if (keyword) params.keyword = keyword;
    if (city) params.city = city;
    coreApi.get("/api/ads", { params })
      .then((res) => setAds(res.data))
      .catch(() => setAds([]))
      .finally(() => setLoading(false));
  }, [category, keyword, city]);

  const filtered = ads
    .filter((ad) => planFilter === "All" || ad.planType?.toUpperCase() === planFilter.toUpperCase())
    .sort((a, b) => {
      if (sort === "rating") return (b.averageRating ?? 0) - (a.averageRating ?? 0);
      if (sort === "reviews") return (b.totalReviews ?? 0) - (a.totalReviews ?? 0);
      const order = { PLATINUM: 0, GOLD: 1, SILVER: 2 };
      return (order[a.planType?.toUpperCase()] ?? 3) - (order[b.planType?.toUpperCase()] ?? 3);
    });

  const submitSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) next.set("keyword", searchInput.trim());
    else next.delete("keyword");
    if (locationInput.trim()) next.set("city", locationInput.trim());
    else next.delete("city");
    setSearchParams(next);
  };

  const setCategory = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("category", value);
    else next.delete("category");
    setSearchParams(next);
  };

  return (
    <Layout>
      <div className="bg-navy px-5 py-7">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-heading text-[28px] font-extrabold text-white mb-4">Browse All Ads</h1>
          <form onSubmit={submitSearch} className="flex max-w-2xl gap-2 rounded-xl bg-white p-1.5">
            <div className="flex flex-[2] items-center gap-2 px-3">
              <svg width="16" height="16" fill="none" stroke="#FF6F61" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name..."
                className="flex-1 border-none text-sm outline-none"
              />
            </div>
            <div className="flex min-w-[120px] items-center gap-1.5 border-l border-slate-200 px-3">
              <span className="text-sm">📍</span>
              <select
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full cursor-pointer border-none bg-transparent text-[13px] text-charcoal outline-none"
              >
                <option value="">Any location</option>
                {locations.map((loc) => (
                  <option key={loc.locationId} value={loc.city}>{loc.city}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="rounded-lg bg-coral px-5 py-2 text-sm font-bold text-white">Search</button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-6">
        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          <div className="flex flex-1 flex-wrap gap-1.5">
            {CATEGORY_PILLS.map((c) => (
              <button
                key={c.label}
                onClick={() => setCategory(c.value)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${
                  category === c.value ? "border-navy bg-navy text-white" : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[13px]">
              <option value="All">All Plans</option>
              <option value="PLATINUM">Platinum</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[13px]">
              <option value="tier">Sort: By Tier</option>
              <option value="rating">Sort: By Rating</option>
              <option value="reviews">Sort: By Reviews</option>
            </select>
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-400">{loading ? "Loading..." : `${filtered.length} ads found`}</p>

        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(258px, 1fr))" }}>
          {filtered.map((ad) => <AdCard key={ad.adId} ad={ad} />)}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <div className="mb-3 text-5xl">🔍</div>
            <p>No ads found. Try a different search or category.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
