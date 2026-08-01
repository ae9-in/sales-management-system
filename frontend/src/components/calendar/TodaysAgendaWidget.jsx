import React from 'react';
import { parseISO, format, isToday } from 'date-fns';

const TodaysAgendaWidget = ({ sales = [] }) => {
  // Extract today's events from DB
  const list = sales.filter(s => {
    try {
      const d = parseISO(s.date);
      return isToday(d);
    } catch {
      return false;
    }
  }).map(s => {
    let timeStr = '10:00 AM';
    try {
      timeStr = format(parseISO(s.date), 'hh:mm a');
    } catch {}
    return {
      time: timeStr,
      title: s.product,
      subtitle: s.customer || 'Walk-in',
      color: s.status === 'Paid' ? 'bg-emerald-500' : 'bg-red-500'
    };
  }).slice(0, 3);

  const hasData = list.length > 0;

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl mb-6">
      <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-gray-900 text-sm">Today's Agenda</h3>
          <span className="text-emerald-600 text-xs font-semibold">{format(new Date(), "dd MMMM yyyy")}</span>
      </div>
      
      {hasData ? (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[60px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-100 mb-6">
            {list.map((evt, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal group">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border-2 border-gray-800 absolute left-[60px] bg-white z-10">
                        <div className={`w-1.5 h-1.5 rounded-full ${evt.color}`}></div>
                    </div>
                    
                    <div className="w-[50px] text-right text-xs font-medium text-gray-500 shrink-0">
                        {evt.time}
                    </div>

                    <div className="w-[calc(100%-70px)] pl-4 text-left">
                        <h4 className="text-sm font-semibold text-gray-200 truncate">{evt.title}</h4>
                        <p className="text-[10px] text-gray-500">{evt.subtitle}</p>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-gray-500">
          No agenda events scheduled for today.
        </div>
      )}
    </div>
  );
};

export default TodaysAgendaWidget;

