import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TopProductsChart = ({ sales = [] }) => {
  // Aggregate sales by product
  const aggregated = sales.reduce((acc, sale) => {
    acc[sale.product] = (acc[sale.product] || 0) + (sale.quantity || 0);
    return acc;
  }, {});

  const data = Object.keys(aggregated).map(name => ({
    name,
    value: aggregated[name]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const hasData = data.length > 0;

  return (
    <div className="glass-card-elevated p-5 h-[300px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Top Products</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">By units sold</p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">Top 5</span>
      </div>
      <div className="flex-1 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis type="number" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} width={120} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.96)', border: '1px solid rgba(248,178,178,0.5)', borderRadius: '10px', boxShadow: '0 8px 24px -4px rgba(139,99,155,0.15)', color: '#111827', fontSize: '12px' }} />
              <Bar dataKey="value" fill="#8B639B" radius={[0, 4, 4, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-gray-400">No product data yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProductsChart;







