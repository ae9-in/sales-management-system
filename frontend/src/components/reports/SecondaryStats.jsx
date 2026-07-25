import React from 'react';
import { IndianRupee, Clock, Tag, FileText } from 'lucide-react';

const Card = ({ title, amount, subtext, icon: Icon, colorClass }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-800 border border-gray-700 rounded-xl flex-1">
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{title}</p>
      <h3 className="text-lg font-bold text-gray-200">{amount}</h3>
      <p className="text-[10px] text-gray-500">{subtext}</p>
    </div>
  </div>
);

const SecondaryStats = ({ sales = [] }) => {
  const activeSales = sales.filter(s => s.status !== 'Pending');
  const totalRevenue = activeSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const paidAmount = sales.filter(s => s.status === 'Paid').reduce((sum, s) => sum + (s.total || 0), 0);
  const pendingAmount = sales.filter(s => s.status === 'Partial').reduce((sum, s) => sum + (s.total || 0), 0);
  const estDiscount = Math.round(totalRevenue * 0.05);
  const estTax = Math.round(totalRevenue * 0.18);

  const getPct = (val) => totalRevenue > 0 ? ((val / totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Card title="Paid Amount" amount={`₹${paidAmount.toLocaleString()}`} subtext={`${getPct(paidAmount)}% of Total Revenue`} icon={IndianRupee} colorClass="bg-green-500/20 text-green-400" />
      <Card title="Pending Amount" amount={`₹${pendingAmount.toLocaleString()}`} subtext={`${getPct(pendingAmount)}% of Total Revenue`} icon={Clock} colorClass="bg-orange-500/20 text-orange-400" />
      <Card title="Total Discounts" amount={`₹${estDiscount.toLocaleString()}`} subtext={`${getPct(estDiscount)}% of Total Revenue`} icon={Tag} colorClass="bg-pink-500/20 text-pink-400" />
      <Card title="Total Tax (18% GST)" amount={`₹${estTax.toLocaleString()}`} subtext={`${getPct(estTax)}% of Total Revenue`} icon={FileText} colorClass="bg-blue-500/20 text-blue-400" />
    </div>
  );
};

export default SecondaryStats;
