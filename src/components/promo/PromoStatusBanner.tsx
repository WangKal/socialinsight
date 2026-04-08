import { motion } from "motion/react";
import { Clock, CheckCircle, Calendar, Play } from "lucide-react";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";

export type PromoStatus = "scheduled" | "active" | "completed";

interface PromoStatusBannerProps {
  status: PromoStatus;
  startTime: string;
  endTime: string;
}

export function PromoStatusBanner({ status, startTime, endTime }: PromoStatusBannerProps) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const targetTime = status === "scheduled" 
        ? new Date(startTime).getTime() 
        : status === "active"
        ? new Date(endTime).getTime()
        : 0;

      if (!targetTime) {
        setCountdown("");
        return;
      }

      const distance = targetTime - now;

      if (distance < 0) {
        setCountdown("Ended");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [status, startTime, endTime]);

  const getStatusInfo = () => {
    switch (status) {
      case "scheduled":
        return {
          icon: Calendar,
          label: "Scheduled",
          color: "from-blue-600 to-indigo-600",
          bgColor: "from-blue-50 to-indigo-50",
          textColor: "text-blue-900",
          countdownLabel: "Starts in:",
        };
      case "active":
        return {
          icon: Play,
          label: "Active",
          color: "from-green-600 to-emerald-600",
          bgColor: "from-green-50 to-emerald-50",
          textColor: "text-green-900",
          countdownLabel: "Ends in:",
        };
      case "completed":
        return {
          icon: CheckCircle,
          label: "Completed",
          color: "from-gray-600 to-gray-700",
          bgColor: "from-gray-50 to-gray-100",
          textColor: "text-gray-900",
          countdownLabel: "",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${statusInfo.bgColor} rounded-xl p-6 shadow-lg border border-gray-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full bg-gradient-to-br ${statusInfo.color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className={`text-2xl ${statusInfo.textColor}`}>
                Promo Status
              </h3>
              <Badge
                className={`bg-gradient-to-r ${statusInfo.color} text-white`}
              >
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {status === "scheduled" && `Starts: ${new Date(startTime).toLocaleString()}`}
              {status === "active" && `Ends: ${new Date(endTime).toLocaleString()}`}
              {status === "completed" && `Ended: ${new Date(endTime).toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* Countdown */}
        {countdown && status !== "completed" && (
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">{statusInfo.countdownLabel}</p>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <p className={`text-3xl ${statusInfo.textColor} font-mono`}>
                {countdown}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              new Date(startTime) <= new Date() ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className="text-gray-600">Started</span>
          </div>
          <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: status === "completed" 
                  ? "100%" 
                  : status === "active"
                  ? "50%"
                  : "0%"
              }}
              transition={{ duration: 1 }}
              className={`h-full bg-gradient-to-r ${statusInfo.color}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Ended</span>
            <div className={`w-3 h-3 rounded-full ${
              status === "completed" ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
