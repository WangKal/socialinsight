import { motion } from "motion/react";
import { FileText, Users, Hash, CheckCircle, Sparkles, Calendar, Gift } from "lucide-react";
import { Badge } from "../ui/badge";
import type { PromoType } from "./PromoForm";

interface PromoRulesCardProps {
  type: PromoType;
  numberOfWinners: number;
  interval?: number;
  correctAnswer?: string;
  caseSensitive?: boolean;
  startTime: string;
  endTime: string;
  prize?: string;
}

export function PromoRulesCard({
  type,
  numberOfWinners,
  interval,
  correctAnswer,
  caseSensitive,
  startTime,
  endTime,
  prize,
}: PromoRulesCardProps) {
  const getTypeInfo = () => {
    switch (type) {
      case "first-n":
        return {
          icon: Users,
          label: "First N Responders",
          description: `First ${numberOfWinners} valid ${numberOfWinners === 1 ? 'responder' : 'responders'} will win`,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "every-nth":
        return {
          icon: Hash,
          label: "Every Nth Responder",
          description: `Every ${interval}${interval === 10 ? 'th' : interval === 1 ? 'st' : interval === 2 ? 'nd' : interval === 3 ? 'rd' : 'th'} responder wins (up to ${numberOfWinners} ${numberOfWinners === 1 ? 'winner' : 'winners'})`,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        };
      case "correct-answer":
        return {
          icon: CheckCircle,
          label: "Correct Answer",
          description: `Winners who answer correctly${caseSensitive ? " (case sensitive)" : ""}`,
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "random":
        return {
          icon: Sparkles,
          label: "Random Winner",
          description: `${numberOfWinners} random ${numberOfWinners === 1 ? 'winner' : 'winners'} from valid replies`,
          color: "text-pink-600",
          bgColor: "bg-pink-50",
        };
    }
  };

  const typeInfo = getTypeInfo();
  const Icon = typeInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
    >
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-violet-600" />
        <h3 className="text-xl text-gray-900">Promo Rules</h3>
      </div>

      <div className="space-y-4">
        {/* Type */}
        <div className={`${typeInfo.bgColor} rounded-lg p-4`}>
          <div className="flex items-center gap-3 mb-2">
            <Icon className={`w-6 h-6 ${typeInfo.color}`} />
            <div>
              <Badge variant="outline">{typeInfo.label}</Badge>
            </div>
          </div>
          <p className="text-sm text-gray-700">{typeInfo.description}</p>
        </div>

        {/* Correct Answer (if applicable) */}
        {type === "correct-answer" && correctAnswer && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Correct Answer:</p>
            <p className="text-gray-900 font-mono bg-white px-3 py-2 rounded border border-gray-200">
              {correctAnswer}
            </p>
            {caseSensitive && (
              <p className="text-xs text-gray-500 mt-2">⚠️ Case sensitive matching enabled</p>
            )}
          </div>
        )}

        {/* Prize */}
        {prize && (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-violet-600" />
              <p className="text-sm text-gray-700">Prize:</p>
            </div>
            <p className="text-gray-900">{prize}</p>
          </div>
        )}

        {/* Schedule */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <p className="text-sm text-gray-700">Schedule:</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Start:</span>
              <span className="text-gray-900">
                {new Date(startTime).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">End:</span>
              <span className="text-gray-900">
                {new Date(endTime).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Winners Info */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-700">Total Winners:</span>
          </div>
          <span className="text-2xl text-blue-600">{numberOfWinners}</span>
        </div>
      </div>
    </motion.div>
  );
}
