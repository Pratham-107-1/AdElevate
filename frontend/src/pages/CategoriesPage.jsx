import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { coreApi } from "../api/client";
import { ALL_CATEGORIES } from "../constants/categories";
import { formatCategory } from "../utils/format";

export default function CategoriesPage() {
  const [counts, setCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all(
      ALL_CATEGORIES.map((c) =>
        coreApi.get("/api/ads", { params: { status: "APPROVED", category: c } })
          .then((res) => [c, res.data.length])
          .catch(() => [c, 0])
      )
    ).then((entries) => setCounts(Object.fromEntries(entries)));
  }, []);

  return (
    <Layout>
      <div className="bg-navy px-5 py-10 text-center">
        <h1 className="font-heading text-3xl font-extrabold text-white">Browse by Category</h1>
        <p className="mt-2 text-sm text-white/55">All {ALL_CATEGORIES.length} categories covering nearly every business and service</p>
      </div>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {ALL_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => navigate(`/browse?category=${c}`)}
              className="rounded-2xl bg-white p-5 text-left shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-transform"
            >
              <div className="font-heading text-base font-bold text-navy">{formatCategory(c)}</div>
              <div className="mt-1 text-sm text-slate-400">
                {counts[c] != null ? `${counts[c]} ads` : "Loading..."}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
