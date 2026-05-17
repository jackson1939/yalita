import { Badge } from "@/components/ui";
import { getScoreTier } from "@yalita/shared";

interface ScoreTierBadgeProps {
  score: number;
  size?: "sm" | "md";
  showScore?: boolean;
}

export function ScoreTierBadge({ score, size = "sm", showScore = false }: ScoreTierBadgeProps) {
  const tier = getScoreTier(score);
  return (
    <Badge variant="custom" color={tier.color} size={size} dot>
      {showScore && `${score} · `}{tier.label}
    </Badge>
  );
}
