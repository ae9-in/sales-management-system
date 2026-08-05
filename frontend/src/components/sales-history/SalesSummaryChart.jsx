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
    <div className="glass-card-elevated p-5 h-[230px] flex flex-col mb-6">
      <h3 className="font-semibold text-gray-900 text-sm mb-4">Sales Trends</h3>
      <div className="flex-1 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSalesHist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B639B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B639B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.96)', border: '1px solid rgba(248,178,178,0.5)', borderRadius: '10px', boxShadow: '0 8px 24px -4px rgba(139,99,155,0.15)', color: '#111827', fontSize: '12px' }} />
              <Area type="monotone" dataKey="value" stroke="#8B639B" strokeWidth={2} fillOpacity={1} fill="url(#colorSalesHist)" />
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







