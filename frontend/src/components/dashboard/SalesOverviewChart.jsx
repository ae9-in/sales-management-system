import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { parseISO, format } from 'date-fns';

const SalesOverviewChart = ({ sales = [] }) => {
  // Aggregate sales by date
    // Aggregate sales by date
  const aggregated = sales.reduce((acc, sale) => {
    try {
      const dateStr = sale.date.split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + (sale.total || 0);
    } catch {}
    return acc;
  }, {});

  const sortedDates = Object.keys(aggregated).sort();
  const data = sortedDates.map(dateStr => {
    let dayLabel = dateStr;
    try {
      dayLabel = format(parseISO(dateStr), 'dd MMM');
    } catch {}
    return {
      day: dayLabel,
      value: aggregated[dateStr]
    };
  }).slice(-7);

  const hasData = data.length > 0;

  return (
    <div className="glass-card-elevated p-5 h-[300px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Sales Overview</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Revenue trend over time</p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">Last 7 days</span>
      </div>
      <div className="flex-1 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(167,243,208,0.5)',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px -4px rgba(5,150,105,0.15)',
                  color: '#111827',
                  fontSize: '12px',
                }}
                cursor={{ stroke: '#34d399', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="value" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" dot={false} activeDot={{ r: 5, fill: '#059669', stroke: 'white', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full glass-icon flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-xs text-gray-400">No sales data yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOverviewChart;






