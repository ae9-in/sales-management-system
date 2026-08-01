import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PaymentMethodBars = ({ sales = [] }) => {
  const activeSales = sales.filter(s => s.status !== 'Pending');
  const aggregated = activeSales.reduce((acc, s) => {
    const method = s.method || 'UPI';
    acc[method] = (acc[method] || 0) + (s.total || 0);
    return acc;
  }, {});

  const chartData = Object.keys(aggregated).map(name => ({
    name,
    value: aggregated[name]
  }));

  const hasData = chartData.length > 0;

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl h-[230px] flex flex-col mb-6">
      <h3 className="font-semibold text-gray-900 text-sm mb-4">Payment Methods Overview</h3>
      <div className="flex-1 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#34d399" radius={[4, 4, 0, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-500">
            No payment data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodBars;



