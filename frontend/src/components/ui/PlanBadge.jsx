const PLAN_STYLE = {
  PLATINUM: { icon: "💎", label: "Platinum", classes: "text-platinum bg-platinum-bg border-platinum-border" },
  GOLD:     { icon: "🥇", label: "Gold",     classes: "text-gold bg-gold-bg border-gold-border" },
  SILVER:   { icon: "🥈", label: "Silver",   classes: "text-silver bg-silver-bg border-silver-border" },
};

export default function PlanBadge({ plan }) {
  const s = PLAN_STYLE[plan?.toUpperCase()];
  if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${s.classes}`}>
      {s.icon} {s.label}
    </span>
  );
}

export { PLAN_STYLE };
