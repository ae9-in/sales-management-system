import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { parseISO, format } from 'date-fns';

const SalesSummaryChart = ({ sales = [] }) => {
  const aggregated = sales.reduce((acc, sale) => {
    try {
      const dateStr = format(parseISO(sale.date), 'dd MMM');
      acc[dateStr] = (acc[dateStr] || 0) + (sale.total || 0);
    } catch {}
    return acc;
  }, {});

  const chartData = Object.keys(aggregated).map(day => ({
    day,
    value: aggregated[day]
  })).sort((a, b) => new Date(a.day) - new Date(b.day));

  const hasData = chartData.length > 0;

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl h-[230px] flex flex-col mb-6">
      <h3 className="font-semibold text-gray-100 text-sm mb-4">Sales Trends</h3>
      <div className="flex-1 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSalesHist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSalesHist)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-500">
            No sales trends available.
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesSummaryChart;
