import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const PaymentMethodsChart = ({ sales = [] }) => {
  // Aggregate totals by payment method
  const aggregated = sales.reduce((acc, s) => {
    const method = s.method || 'UPI';
    acc[method] = (acc[method] || 0) + (s.total || 0);
    return acc;
  }, {});

  const data = Object.keys(aggregated).map(name => ({
    name,
    value: aggregated[name]
  }));

  const hasData = data.length > 0;

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl h-[230px] flex flex-col relative justify-between">
      <h3 className="font-semibold text-gray-100 text-sm mb-2">Payment Methods</h3>
      {hasData ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-[150px] h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-gray-400 pl-4">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="truncate w-16 block font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
          No payment method data.
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsChart;
