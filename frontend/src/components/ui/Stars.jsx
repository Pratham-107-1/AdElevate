export default function Stars({ rating, reviews }) {
  // averageRating/totalReviews can be null when an ad has no reviews yet -
  // the real backend allows that, unlike the Figma mock data which always
  // had a rating.
  if (rating == null) {
    return <span className="text-xs text-slate-400">No reviews yet</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} width="13" height="13" viewBox="0 0 12 12"
               fill={i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0"}>
            <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.1L6 8l-2.78 1.56.53-3.1L1.5 4.27l3.11-.45L6 1z" />
          </svg>
        ))}
        <span className="ml-1 text-xs font-semibold text-slate-500">{rating.toFixed(1)}</span>
      </span>
      {reviews != null && <span className="text-[11px] text-slate-300">({reviews} reviews)</span>}
    </div>
  );
}
