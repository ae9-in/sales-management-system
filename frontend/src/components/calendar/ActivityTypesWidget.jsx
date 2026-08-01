import React from 'react';
import { Calendar as CalIcon, PhoneCall, Presentation, FileText, CreditCard, LayoutGrid } from 'lucide-react';

const ActivityTypesWidget = ({ sales = [] }) => {
  const meetingsCount = sales.filter(s => s.status === 'Paid').length;
  const followUpsCount = sales.filter(s => s.status !== 'Paid').length;
  const paymentsCount = sales.length;

  const types = [
    { icon: CalIcon, name: 'Meetings', count: meetingsCount, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' },
    { icon: PhoneCall, name: 'Follow-ups', count: followUpsCount, color: 'text-green-400 bg-green-500/10 border-green-500/30' },
    { icon: Presentation, name: 'Demos / Proposals', count: 0, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
    { icon: FileText, name: 'Quotations', count: 0, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { icon: CreditCard, name: 'Payments', count: paymentsCount, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
    { icon: LayoutGrid, name: 'Other Activities', count: 0, color: 'text-gray-500 bg-gray-500/10 border-gray-500/30' },
  ];

  return (
    <div className="glass-card-elevated p-5 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm">Activity Types</h3>
      <div className="space-y-3">
        {types.map((t, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                  <div className={`p-1.5 border rounded-lg ${t.color}`}>
                      <t.icon size={16} />
                  </div>
                  <span className="text-gray-600">{t.name}</span>
              </div>
              <span className="text-gray-500 font-semibold">{t.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTypesWidget;




