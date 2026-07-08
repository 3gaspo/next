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
      <div className="h-64 flex items-center justify-center text-zinc-400 font-medium">
        No data available for this period
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E2E2" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 600, fill: '#A1A1AA' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 600, fill: '#A1A1AA' }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
          />
          <Bar 
            dataKey="count" 
            fill="currentColor" 
            className="text-zinc-900 dark:text-white" 
            radius={[4, 4, 0, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
