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

  const chartData = data.length > 0 ? data : [
    { day: '01 Jul', revenue: 45000, orders: 20 },
    { day: '04 Jul', revenue: 65000, orders: 35 },
    { day: '07 Jul', revenue: 40000, orders: 25 },
    { day: '10 Jul', revenue: 85000, orders: 40 },
    { day: '13 Jul', revenue: 55000, orders: 28 },
    { day: '16 Jul', revenue: 65000, orders: 38 },
    { day: '20 Jul', revenue: 95000, orders: 45 },
  ];

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl h-[300px] flex flex-col relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-100 text-sm">Sales Overview</h3>
        <select className="bg-gray-700 border border-gray-600 text-xs text-gray-300 rounded px-2 py-1"><option>Daily</option></select>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#9ca3af', top: '-10px' }}/>
            <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesOverviewChart;
