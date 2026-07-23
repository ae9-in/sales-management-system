import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Paid', value: 65, color: '#3b82f6' },
  { name: 'Pending', value: 25, color: '#f59e0b' },
  { name: 'Partial', value: 10, color: '#10b981' },
];

const PaymentStatusChart = () => (
  <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl h-[300px]">
    <h3 className="font-semibold text-gray-100 mb-4">Sales by Payment Status</h3>
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
          <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: '#d1d5db', fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default PaymentStatusChart;
