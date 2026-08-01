import React from 'react';
import { Clock } from 'lucide-react';
import { parseISO, format, addDays } from 'date-fns';

const PendingFollowUps = ({ sales = [] }) => {
  const pendingSales = sales.filter(s => s.status === 'Pending' || s.status === 'Partial').slice(0, 3);

  return (
    <div className="glass-card-elevated p-5 h-full flex flex-col">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm">Pending Follow-ups</h3>
      <div className="flex-1 space-y-4">
        {pendingSales.map((s, i) => {
          let dateStr = 'Tomorrow';
          try {
            // Due date is 3 days after transaction date
            const date = addDays(parseISO(s.date), 3);
            dateStr = format(date, 'dd MMM yyyy');
          } catch {}
          return (
            <div key={s.id || i} className="flex justify-between items-start">
              <div className="flex gap-3">
                <Clock className="text-orange-400 w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-800">{s.customer || 'Walk-in'} - {s.status} Payment</p>
                  <p className="text-xs text-gray-500">{s.rep} ({s.product})</p>
                </div>
              </div>
              <span className="text-xs whitespace-nowrap text-gray-500">{dateStr}</span>
            </div>
          );
        })}
        {pendingSales.length === 0 && (
          <div className="text-center text-xs py-8 text-gray-500">No pending follow-ups.</div>
        )}
      </div>
      <button className="text-emerald-600 text-xs mt-4 hover:underline text-center w-full">View All Follow-ups</button>
    </div>
  );
};

export default PendingFollowUps;







