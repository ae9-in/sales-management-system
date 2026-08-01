import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#059669', '#10b981', '#f59e0b', '#34d399'];

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
    <div className="glass-card-elevated p-5 h-[230px] flex flex-col relative justify-between">
      <h3 className="font-semibold text-gray-900 text-sm mb-2">Payment Methods</h3>
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
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.96)', border: '1px solid rgba(167,243,208,0.5)', borderRadius: '10px', boxShadow: '0 8px 24px -4px rgba(5,150,105,0.15)', color: '#111827', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-gray-500 pl-4">
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






