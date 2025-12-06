import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TrendData {
  date: string;
  sentiment: number;
  agreement: number;
  replies: number;
}

interface TrendChartProps {
  data: TrendData[];
  title?: string;
}

export function TrendChart({ data, title = "Trend Analysis" }: TrendChartProps) {
  // Calculate trend (comparing first and last data points)
  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];
  const sentimentTrend = lastPoint ? lastPoint.sentiment - firstPoint.sentiment : 0;
  const agreementTrend = lastPoint ? lastPoint.agreement - firstPoint.agreement : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500">Performance over time</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            {sentimentTrend >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={sentimentTrend >= 0 ? "text-green-600" : "text-red-600"}>
              Sentiment {sentimentTrend >= 0 ? "+" : ""}{sentimentTrend.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            {agreementTrend >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={agreementTrend >= 0 ? "text-green-600" : "text-red-600"}>
              Agreement {agreementTrend >= 0 ? "+" : ""}{agreementTrend.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="agreementGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="sentiment"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#sentimentGradient)"
            name="Sentiment %"
          />
          <Area
            type="monotone"
            dataKey="agreement"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#agreementGradient)"
            name="Agreement %"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
