import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Paid', value: 65, color: '#403D88' },
  { name: 'Pending', value: 25, color: '#f59e0b' },
  { name: 'Partial', value: 10, color: '#AF719D' },
];

const PaymentStatusChart = () => (
  <div className="glass-card-elevated p-5 h-[300px]">
    <h3 className="font-semibold text-gray-900 mb-4">Sales by Payment Status</h3>
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
          <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.96)', border: '1px solid rgba(248,178,178,0.5)', borderRadius: '10px', boxShadow: '0 8px 24px -4px rgba(139,99,155,0.15)', color: '#111827', fontSize: '12px' }} />
          <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: '#d1d5db', fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default PaymentStatusChart;







