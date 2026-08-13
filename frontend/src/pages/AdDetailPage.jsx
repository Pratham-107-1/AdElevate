import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Stars from "../components/ui/Stars";
import PlanBadge from "../components/ui/PlanBadge";
import { coreApi, resolveImageUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AdDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role, userId } = useAuth();

  const [ad, setAd] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rrRating, setRrRating] = useState(0);
  const [rrHover, setRrHover] = useState(0);
  const [rrText, setRrText] = useState("");
  const [rrSubmitting, setRrSubmitting] = useState(false);
  const [rrError, setRrError] = useState(null);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      coreApi.get(`/api/ads/${id}`),
      coreApi.get(`/api/ads/${id}/ratings`),
    ])
      .then(([adRes, reviewsRes]) => {
        setAd(adRes.data);
        setReviews(reviewsRes.data);
      })
      .catch(() => setError("Could not load this ad."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setRrError(null);
    if (role !== "CUSTOMER") {
      setRrError("Only customer accounts can leave a review.");
      return;
    }
    if (rrRating < 1) {
      setRrError("Please select a star rating.");
      return;
    }
    setRrSubmitting(true);
    try {
      await coreApi.post(`/api/ads/${id}/ratings`, {
        customerId: userId,
        ratingValue: rrRating,
        reviewText: rrText,
      });
      setRrText("");
      setRrRating(0);
      loadAll(); // refresh list + average rating
    } catch (err) {
      setRrError(err.response?.data?.error || err.response?.data || "Could not submit review.");
    } finally {
      setRrSubmitting(false);
    }
  };

  if (loading) return <Layout><p className="py-20 text-center text-slate-400">Loading...</p></Layout>;
  if (error || !ad) return <Layout><p className="py-20 text-center text-brand-red">{error || "Ad not found."}</p></Layout>;

  const imageUrl = resolveImageUrl(ad.productImage);

  return (
    <Layout>
      <div className="border-b border-slate-200 bg-white px-5 py-3">
        <div className="mx-auto max-w-6xl">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500">
            ← Back to listings
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-7 lg:grid-cols-[1fr_360px]">
        {/* LEFT */}
        <div>
          <div className="relative mb-5 h-80 overflow-hidden rounded-2xl bg-slate-200">
            {imageUrl ? (
              <img src={imageUrl} alt={ad.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No image</div>
            )}
            <div className="absolute top-3.5 left-3.5"><PlanBadge plan={ad.planType} /></div>
          </div>

          <div className="mb-4 rounded-2xl bg-white p-7">
            <h1 className="font-heading text-2xl font-extrabold text-navy mb-2.5">{ad.title}</h1>
            <div className="mb-3.5 flex flex-wrap gap-4 text-sm text-slate-500">
              <span>📍 {ad.city}</span>
              <span>🏷️ {ad.category?.replaceAll("_", " ")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Stars rating={ad.averageRating} />
              {ad.totalReviews != null && <span className="text-[13px] text-slate-400">{ad.totalReviews} verified reviews</span>}
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-charcoal">
              {ad.description || "No description provided."}
            </p>
            <div className="mt-5 rounded-xl bg-misty p-4">
              <div className="font-heading text-xl font-extrabold text-sapphire">{ad.priceRange}</div>
              <div className="text-[13px] text-slate-400">Pricing may vary. Contact for a custom quote.</div>
            </div>
          </div>

          {/* Reviews */}
          <div className="rounded-2xl bg-white p-7">
            <h3 className="font-heading text-lg font-bold text-navy mb-4">Customer Reviews</h3>
            {reviews.length === 0 && <p className="text-sm text-slate-400 mb-4">No reviews yet.</p>}
            {reviews.map((r, i) => (
              <div key={r.ratingId} className={`flex gap-3 mb-4 pb-4 ${i < reviews.length - 1 ? "border-b border-slate-100" : ""}`}>
                <div className="flex h-9.5 w-9.5 flex-shrink-0 items-center justify-center rounded-full bg-sapphire text-xs font-bold text-white" style={{ height: 38, width: 38 }}>
                  {r.customerName?.slice(0, 2).toUpperCase() || "??"}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2.5">
                    <span className="text-sm font-bold text-navy">{r.customerName}</span>
                    <Stars rating={r.ratingValue} />
                  </div>
                  <p className="text-sm leading-relaxed text-charcoal">{r.reviewText}</p>
                </div>
              </div>
            ))}

            {isAuthenticated && role === "CUSTOMER" ? (
              <form onSubmit={submitReview} className="mt-2.5 rounded-xl bg-misty p-4.5">
                <h4 className="mb-2.5 text-sm font-bold text-navy">Leave a Review</h4>
                <div className="mb-3 flex gap-1" onMouseLeave={() => setRrHover(0)}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRrRating(s)}
                      onMouseEnter={() => setRrHover(s)}
                      className="p-0 text-2xl"
                      style={{ color: s <= (rrHover || rrRating) ? "#f59e0b" : "#e2e8f0" }}
                    >
                      ★
                    </button>
                  ))}
                  {rrRating > 0 && <span className="ml-2 self-center text-xs text-slate-400">{rrRating}/5</span>}
                </div>
                <textarea value={rrText} onChange={(e) => setRrText(e.target.value)} placeholder="Share your experience..." rows={3}
                  className="w-full rounded-lg border-[1.5px] border-slate-200 px-3 py-2 text-sm" />
                {rrError && <p className="mt-2 text-sm text-brand-red">{rrError}</p>}
                <button type="submit" disabled={rrSubmitting} className="mt-2.5 rounded-lg bg-navy px-5 py-2 text-[13px] font-bold text-white disabled:opacity-60">
                  {rrSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <p className="mt-2 text-xs text-slate-400">Log in as a customer to leave a review.</p>
            )}
          </div>
        </div>

        {/* RIGHT - contact card */}
        <div>
          <div className="sticky top-20 rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.07)]">
            <h3 className="font-heading text-lg font-bold text-navy mb-1">Contact Provider</h3>
            {ad.vendorBusinessName && (
              <p className="mb-1 text-sm font-semibold text-sapphire">{ad.vendorBusinessName}</p>
            )}
            {ad.vendorName && (
              <p className="mb-4 text-xs text-slate-400">{ad.vendorName}</p>
            )}

            {ad.vendorPhone && (
              <a
                href={`tel:${ad.vendorPhone}`}
                className="mb-2 flex items-center gap-2.5 rounded-[10px] bg-navy px-4 py-3 text-sm font-bold text-white no-underline"
              >
                📞 {ad.vendorPhone}
              </a>
            )}
            {ad.vendorEmail && (
              <a
                href={`mailto:${ad.vendorEmail}`}
                className="flex items-center gap-2.5 rounded-[10px] bg-misty px-4 py-3 text-sm text-charcoal no-underline break-all"
              >
                ✉️ {ad.vendorEmail}
              </a>
            )}
            {!ad.vendorPhone && !ad.vendorEmail && (
              <p className="text-sm text-slate-400">No contact details available for this provider.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
