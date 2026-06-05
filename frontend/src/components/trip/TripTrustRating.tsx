import { cn } from "@/lib/utils";

type TripTrustRatingProps = {
  value?: number | string | null;
  className?: string;
};

export default function TripTrustRating({
  value,
  className,
}: TripTrustRatingProps) {
  const rating = normalizeRating(value);
  const filledStars = Math.round(Math.max(0, Math.min(5, rating)));
  const stars = `${"★".repeat(filledStars)}${"☆".repeat(5 - filledStars)}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold text-slate-500",
        className,
      )}
      aria-label={`${rating.toFixed(1)} trên 5 sao`}
    >
      <span className="font-mono tracking-normal text-amber-500">{stars}</span>
      <span>{rating.toFixed(1)}</span>
    </span>
  );
}

function normalizeRating(value?: number | string | null) {
  const rating = Number(value ?? 0);
  return Number.isFinite(rating) ? rating : 0;
}
