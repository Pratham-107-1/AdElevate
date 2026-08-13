import { Link } from "react-router-dom";
import Stars from "./Stars";
import PlanBadge from "./PlanBadge";
import { resolveImageUrl } from "../../api/client";
import { formatCategory } from "../../utils/format";

const PLAN_BORDER = {
  PLATINUM: "border-2 border-platinum-border",
  GOLD: "border-2 border-gold-border",
  SILVER: "border border-slate-200",
};

export default function AdCard({ ad }) {
  const borderClass = PLAN_BORDER[ad.planType?.toUpperCase()] || "border border-slate-200";
  const imageUrl = resolveImageUrl(ad.productImage);

  return (
    <Link
      to={`/ads/${ad.adId}`}
      className={`group block overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(13,27,42,0.07)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(13,27,42,0.18)] ${borderClass}`}
    >
      <div className="relative h-[188px] overflow-hidden bg-slate-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={ad.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 text-sm">
            No image
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <PlanBadge plan={ad.planType} />
        </div>
        {ad.status === "PENDING_APPROVAL" && (
          <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-bold text-amber-200">
            Pending
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-heading text-[15px] font-bold leading-tight text-navy mb-1">{ad.title}</h3>
        <p className="mb-2 text-xs text-slate-400">
          {formatCategory(ad.category)} · 📍 {ad.city}
        </p>
        <Stars rating={ad.averageRating} reviews={ad.totalReviews} />
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-[13px] font-bold text-sapphire">{ad.priceRange}</span>
          <span className="rounded-lg bg-coral px-3 py-1.5 text-xs font-bold text-white">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
