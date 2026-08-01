import React from 'react';
import { Phone, Mail, Award, Calendar } from 'lucide-react';
import { parseISO, format } from 'date-fns';

const CustomerProfilePanel = ({ customerName, sales = [] }) => {
  if (!customerName) {
    return (
      <div className="glass-card-elevated p-5 text-center text-gray-500 text-xs py-10">
        Select a customer to view profile
      </div>
    );
  }

  // Derive stats
  const customerSales = sales.filter(s => (s.customer || 'Walk-in').trim().toLowerCase() === customerName.trim().toLowerCase());
  const totalSpend = customerSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalOrders = customerSales.length;

  return (
    <div className="glass-card-elevated p-5 flex flex-col gap-6">
      <div className="text-center pb-4 border-b border-gray-200">
        <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-2xl text-gray-900 mx-auto mb-3 shadow-lg shadow-emerald-500/20">
          {customerName.charAt(0)}
        </div>
        <h3 className="font-bold text-gray-900 text-sm truncate">{customerName}</h3>
        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] bg-green-500/10 text-green-400 font-semibold">Active Client</span>
      </div>

      <div className="space-y-3 text-xs text-gray-600">
        <div className="flex gap-3">
          <Phone className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-gray-500 italic">No phone contact saved</span>
        </div>
        <div className="flex gap-3">
          <Mail className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-gray-500 italic">No email contact saved</span>
        </div>
      </div>

      <div className="p-3 glass-card flex items-center gap-3">
        <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-md shrink-0">
          <Award size={18} />
        </div>
        <div>
          <span className="text-[10px] text-gray-500 block">Total Spend</span>
          <span className="text-sm font-bold text-gray-800">₹{totalSpend.toLocaleString()}</span>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 text-xs mb-3">Order History</h4>
        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 no-scrollbar">
          {customerSales.map((item, i) => {
            let dateStr = '20 Jul';
            try {
              dateStr = format(parseISO(item.date), 'dd MMM');
            } catch {}
            return (
              <div key={i} className="flex justify-between items-center text-[10px] p-2 bg-white/40 rounded border border-gray-200/30">
                <span className="text-gray-500">{dateStr}</span>
                <span className="text-gray-600 truncate w-24 block text-center">{item.product}</span>
                <span className="text-emerald-600 font-semibold">₹{item.total.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePanel;





