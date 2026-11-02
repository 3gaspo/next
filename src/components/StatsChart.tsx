import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ChartData {
  date: string;
  count: number;
}

interface StatsChartProps {
  data: ChartData[];
}

export default function StatsChart({ data }: StatsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-ui-ink/40 font-medium">
        No data available for this period
      </div>
    );
  }

  return (
    <div className="ui-chart h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E2E2" opacity={0.3} />
          <XAxis minTickGap={24} interval="preserveStartEnd"
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 600, fill: '#A1A1AA' }}
          />
          <YAxis allowDecimals={false}
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 600, fill: '#A1A1AA' }}
          />
          <Tooltip 
            cursor={{ fill: 'currentColor', opacity: 0.05 }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="ui-chart-tooltip bg-ui-primary text-ui-primary-text px-3 py-2 rounded-xl shadow-lg text-xs font-bold">
                    <p className="opacity-70 text-[10px] uppercase tracking-wider">{label}</p>
                    <p className="text-sm">{payload[0].value} {payload[0].value === 1 ? 'task' : 'tasks'} completed</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar isAnimationActive={false}
            dataKey="count" 
            fill="currentColor" 
            className="text-ui-text"
            radius={[4, 4, 0, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
