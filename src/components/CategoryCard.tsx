import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  count: number;
  avgSentiment: number;
  avgAgreement: number;
  onClick: () => void;
}

export function CategoryCard({
  title,
  icon: Icon,
  count,
  avgSentiment,
  avgAgreement,
  onClick,
}: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="bg-card rounded-2xl p-5 border border-border cursor-pointer group transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
            {count}
          </div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Posts</div>
        </div>
      </div>

      <h3 className="text-base font-semibold text-foreground mt-5 mb-4">{title}</h3>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Sentiment</div>
          <div
            className={`text-sm font-semibold tabular-nums ${
              avgSentiment > 70
                ? "text-green-600"
                : avgSentiment > 40
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {avgSentiment}%
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Agreement</div>
          <div
            className={`text-sm font-semibold tabular-nums ${
              avgAgreement > 60
                ? "text-green-600"
                : avgAgreement > 40
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {avgAgreement}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}
