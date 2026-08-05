import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { parseISO, format } from 'date-fns';

const SalesOverviewChart = ({ sales = [] }) => {
  // Aggregate sales and revenue by day
  const aggregated = sales.reduce((acc, sale) => {
    try {
      const dateKey = sale.date.split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { revenue: 0, orders: 0 };
      }
      acc[dateKey].revenue += (sale.total || 0);
      acc[dateKey].orders += 1;
    } catch {}
    return acc;
  }, {});

  const data = Object.keys(aggregated).map(dateStr => ({
    dateStr,
    day: format(parseISO(dateStr), 'dd MMM'),
    revenue: aggregated[dateStr].revenue,
    orders: aggregated[dateStr].orders
  })).sort((a, b) => new Date(a.dateStr) - new Date(b.dateStr)).slice(-7);

  const hasData = data.length > 0;

  return (
    <div className="glass-card-elevated p-5 h-[300px] flex flex-col relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">Sales Overview</h3>
        <select className="bg-gray-100 border border-gray-200 text-xs text-gray-600 rounded px-2 py-1"><option>Daily</option></select>
      </div>
      <div className="flex-1 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.96)', border: '1px solid rgba(248,178,178,0.5)', borderRadius: '10px', boxShadow: '0 8px 24px -4px rgba(139,99,155,0.15)', color: '#111827', fontSize: '12px' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#9ca3af', top: '-10px' }}/>
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#403D88" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#AF719D" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-500">
            No sales overview data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOverviewChart;







