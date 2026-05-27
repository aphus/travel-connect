import type { AuthUser } from "@/services/auth";

export function getUserInitials(user: Pick<AuthUser, "fullName" | "email"> | null) {
  const label = user?.fullName?.trim() || user?.email?.trim() || "TC";
  const words = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 0) return "TC";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words.map((word) => word[0]).join("").toUpperCase();
}
