import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TodaySalesSummaryChart = ({ sales = [] }) => {
  // Aggregate sales by hour/index for chart representation
  const chartData = sales.map((s, i) => ({
    name: `Sale ${i + 1}`,
    value: s.total
  }));

  const hasData = chartData.length > 0;

  return (
    <div className="glass-card-elevated p-5 h-[230px] flex flex-col relative">
      <h3 className="font-semibold text-gray-900 text-sm mb-4">Today's Sales Trend</h3>
      <div className="flex-1 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDailySales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.96)', border: '1px solid rgba(167,243,208,0.5)', borderRadius: '10px', boxShadow: '0 8px 24px -4px rgba(5,150,105,0.15)', color: '#111827', fontSize: '12px' }} />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDailySales)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-500">
            No sales recorded today.
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaySalesSummaryChart;







