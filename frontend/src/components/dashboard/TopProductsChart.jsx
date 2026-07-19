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
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl h-[300px] flex flex-col relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-100 text-sm">Top Products</h3>
      </div>
      <div className="flex-1 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis type="number" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} width={120} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-500">
            No sales data available for this month.
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProductsChart;
