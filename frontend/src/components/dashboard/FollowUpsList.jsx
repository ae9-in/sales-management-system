import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { parseISO, format } from 'date-fns';

const FollowUpsList = ({ sales = [] }) => {
  const navigate = useNavigate();

  const handleRowClick = (customer) => {
    toast.info(`Opening follow-up schedule for ${customer}`);
  };

  // Extract pending payments as followups
  const pendingSales = sales.filter(s => s.status !== 'Paid');

  const listData = pendingSales.map(s => {
    let dayStr = format(new Date(), 'dd MMM');
    try {
      dayStr = format(parseISO(s.date), 'dd MMM');
    } catch {}
    return {
      date: dayStr,
      customer: s.customer || 'Walk-in',
      rep: s.rep || 'Sales Exec'
    };
  }).slice(0, 5);

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">Upcoming Follow-ups</h3>
        <button 
          onClick={() => navigate('/calendar')}
          className="text-emerald-600 text-xs hover:underline"
        >
          View All
        </button>
      </div>
      <div className="flex-1 overflow-auto space-y-4 mt-2 pr-1 no-scrollbar">
        {listData.map((item, i) => (
          <div 
            key={i} 
            onClick={() => handleRowClick(item.customer)}
            className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-100/30 p-1 rounded transition"
          >
            <div className="flex items-center text-gray-500 w-16">
              <Calendar size={12} className="mr-1" />
              <span>{item.date}</span>
            </div>
            <span className="text-gray-600 flex-1 truncate font-medium">{item.customer}</span>
            <span className="text-gray-500 w-24 truncate text-right">{item.rep}</span>
          </div>
        ))}
        {listData.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-xs">No pending follow-ups.</div>
        )}
      </div>
    </div>
  );
};

export default FollowUpsList;



