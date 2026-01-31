import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from "recharts";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface RawTrendData {
  date: string;
  sentiment: {
    positive?: number;
    neutral?: number;
    negative?: number;
  };
  agreement: {
    agree?: number;
    neutral?: number;
    disagree?: number;
  };
  replies: number;
}

interface DashboardChartsProps {
  data: RawTrendData[];
  title?: string;
}

export function TrendChart({ data, title = "Performance Overview" }: DashboardChartsProps) {
  // Prepare chart data
  const chartData = data.map(d => ({
    date: d.date,
    sentiment_positive: d.sentiment.positive ?? 0,
    sentiment_neutral: d.sentiment.neutral ?? 0,
    sentiment_negative: d.sentiment.negative ?? 0,
    agreement_agree: d.agreement.agree ?? 0,
    agreement_neutral: d.agreement.neutral ?? 0,
    agreement_disagree: d.agreement.disagree ?? 0,
    replies: d.replies,
    avgSentiment: d.sentiment.positive ?? 0,
    avgAgreement: d.agreement.agree ?? 0
  }));

  // Calculate overall trends
  const firstPoint = chartData[0];
  const lastPoint = chartData[chartData.length - 1];
  const sentimentTrend = lastPoint && firstPoint
    ? lastPoint.avgSentiment - firstPoint.avgSentiment
    : 0;
  const agreementTrend = lastPoint && firstPoint
    ? lastPoint.avgAgreement - firstPoint.avgAgreement
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            {sentimentTrend >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
            <span className={sentimentTrend >= 0 ? "text-green-600" : "text-red-600"}>
              Sentiment {sentimentTrend >= 0 ? "+" : ""}{sentimentTrend.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            {agreementTrend >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
            <span className={agreementTrend >= 0 ? "text-green-600" : "text-red-600"}>
              Agreement {agreementTrend >= 0 ? "+" : ""}{agreementTrend.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* 1️⃣ Stacked Area Chart for Sentiment + Agreement */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip />
          <Legend />

          <Area type="monotone" dataKey="sentiment_positive" stackId="sentiment" stroke="#22c55e" fill="#a7f3d0" name="Positive" />
          <Area type="monotone" dataKey="sentiment_neutral" stackId="sentiment" stroke="#facc15" fill="#fde68a" name="Neutral" />
          <Area type="monotone" dataKey="sentiment_negative" stackId="sentiment" stroke="#ef4444" fill="#fca5a5" name="Negative" />

          <Area type="monotone" dataKey="agreement_agree" stackId="agreement" stroke="#3b82f6" fill="#93c5fd" name="Agree" />
          <Area type="monotone" dataKey="agreement_neutral" stackId="agreement" stroke="#facc15" fill="#fde68a" name="Neutral" />
          <Area type="monotone" dataKey="agreement_disagree" stackId="agreement" stroke="#ef4444" fill="#fca5a5" name="Disagree" />
        </AreaChart>
      </ResponsiveContainer>

      {/* 2️⃣ Line Chart for Average Sentiment & Agreement */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis domain={[0, 100]} stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="avgSentiment" stroke="#16a34a" name="Avg Sentiment %" strokeWidth={2} />
          <Line type="monotone" dataKey="avgAgreement" stroke="#2563eb" name="Avg Agreement %" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      {/* 3️⃣ Bar Chart for Replies, colored by positivity */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="replies" name="Replies">
            {chartData.map((entry, index) => {
              const color = entry.avgSentiment >= 70 ? "#16a34a" : entry.avgSentiment >= 40 ? "#facc15" : "#ef4444";
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
