import { Star } from "lucide-react";

type RatingStarsProps = {
  rating: number;
  max?: number;
  className?: string;
  starClassName?: string;
};

export default function RatingStars({
  rating,
  max = 5,
  className = "",
  starClassName = "h-5 w-5",
}: RatingStarsProps) {
  const normalizedRating = Math.max(0, Math.min(max, Number.isFinite(rating) ? rating : 0));
  const visibleStars = Math.ceil(normalizedRating);

  if (visibleStars === 0) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      aria-label={`${normalizedRating.toFixed(1)} trên ${max} sao`}
    >
      {Array.from({ length: visibleStars }).map((_, index) => {
        const fillPercent = Math.max(
          0,
          Math.min(100, (normalizedRating - index) * 100),
        );

        return (
          <span key={index} className={`relative inline-flex shrink-0 ${starClassName}`}>
            <Star className={`absolute inset-0 ${starClassName} fill-amber-100 text-amber-200`} />
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star className={`${starClassName} max-w-none shrink-0 fill-amber-400 text-amber-400`} />
            </span>
          </span>
        );
      })}
    </div>
  );
}
