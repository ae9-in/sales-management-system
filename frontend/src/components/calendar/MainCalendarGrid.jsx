import React from 'react';
import { parseISO } from 'date-fns';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const calendarBaseDays = [
  // Week 1 (Jul 2026 starts on Wed)
  [ { date: 28, isCurrentMonth: false }, { date: 29, isCurrentMonth: false }, { date: 30, isCurrentMonth: false }, { date: 1, isCurrentMonth: true }, { date: 2, isCurrentMonth: true }, { date: 3, isCurrentMonth: true }, { date: 4, isCurrentMonth: true } ],
  // Week 2
  [ { date: 5, isCurrentMonth: true }, { date: 6, isCurrentMonth: true }, { date: 7, isCurrentMonth: true }, { date: 8, isCurrentMonth: true }, { date: 9, isCurrentMonth: true }, { date: 10, isCurrentMonth: true }, { date: 11, isCurrentMonth: true } ],
  // Week 3
  [ { date: 12, isCurrentMonth: true }, { date: 13, isCurrentMonth: true }, { date: 14, isCurrentMonth: true }, { date: 15, isCurrentMonth: true }, { date: 16, isCurrentMonth: true }, { date: 17, isCurrentMonth: true }, { date: 18, isCurrentMonth: true } ],
  // Week 4
  [ { date: 19, isCurrentMonth: true }, { date: 20, isCurrentMonth: true }, { date: 21, isCurrentMonth: true }, { date: 22, isCurrentMonth: true }, { date: 23, isCurrentMonth: true }, { date: 24, isCurrentMonth: true }, { date: 25, isCurrentMonth: true } ],
  // Week 5
  [ { date: 26, isCurrentMonth: true }, { date: 27, isCurrentMonth: true }, { date: 28, isCurrentMonth: true }, { date: 29, isCurrentMonth: true }, { date: 30, isCurrentMonth: true }, { date: 31, isCurrentMonth: true }, { date: 1, isCurrentMonth: false } ]
];

const getEventStyles = (type) => {
  switch(type) {
    case 'meeting': return 'bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-600';
    case 'followup': return 'bg-green-500/10 border-l-2 border-green-500 text-green-400';
    default: return 'bg-purple-500/10 border-l-2 border-purple-500 text-purple-400';
  }
};

const MainCalendarGrid = ({ 
  dbEvents = [], 
  sales = [], 
  selectedDay = 19, 
  setSelectedDay, 
  view = 'month', 
  setView 
}) => {

  // Week selection calculation
  const activeWeek = calendarBaseDays.find(week => 
    week.some(day => day.isCurrentMonth && day.date === selectedDay)
  ) || calendarBaseDays[3];

  // Filter events scheduled on the selected day
  const dayEvents = sales.filter(s => {
    try {
      const parsed = parseISO(s.date);
      return parsed.getMonth() === 6 && parsed.getFullYear() === 2026 && parsed.getDate() === selectedDay;
    } catch {
      return false;
    }
  });

  // Get all scheduled transactions sorted
  const allEventsList = [...sales].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="glass-card-elevated flex flex-col overflow-hidden h-full min-h-[500px]">
      {/* Calendar Header Controls */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white/80">
        <div className="flex bg-white rounded-lg overflow-hidden border border-gray-200">
          <button 
            onClick={() => setView('month')}
            className={`px-4 py-1.5 text-sm font-semibold transition ${view === 'month' ? 'bg-emerald-600 text-gray-900' : 'text-gray-500 hover:bg-white'}`}
          >
            Month
          </button>
          <button 
            onClick={() => setView('week')}
            className={`px-4 py-1.5 text-sm font-semibold transition border-l border-gray-200 ${view === 'week' ? 'bg-emerald-600 text-gray-900' : 'text-gray-500 hover:bg-white'}`}
          >
            Week
          </button>
          <button 
            onClick={() => setView('day')}
            className={`px-4 py-1.5 text-sm font-semibold transition border-l border-gray-200 ${view === 'day' ? 'bg-emerald-600 text-gray-900' : 'text-gray-500 hover:bg-white'}`}
          >
            Day
          </button>
          <button 
            onClick={() => setView('list')}
            className={`px-4 py-1.5 text-sm font-semibold transition border-l border-gray-200 ${view === 'list' ? 'bg-emerald-600 text-gray-900' : 'text-gray-500 hover:bg-white'}`}
          >
            List
          </button>
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {view === 'day' ? `July ${selectedDay}, 2026` : view === 'week' ? 'July 2026 (Week View)' : 'July 2026'}
        </h2>
        <div className="w-[100px]"></div>
      </div>

      {/* Grid rendering based on view */}
      {view === 'month' && (
        <>
          <div className="grid grid-cols-7 border-b border-gray-200 bg-white/50">
            {daysOfWeek.map(day => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{day}</div>
            ))}
          </div>
          <div className="flex-1 grid grid-rows-5 grid-cols-7 bg-gray-100 gap-[1px]">
            {calendarBaseDays.map((week, wIdx) => 
              week.map((day, dIdx) => {
                const matches = dbEvents.filter(evt => day.isCurrentMonth && evt.day === day.date);
                const isSelected = day.isCurrentMonth && day.date === selectedDay;
                return (
                  <div 
                    key={`${wIdx}-${dIdx}`} 
                    onClick={() => day.isCurrentMonth && setSelectedDay(day.date)}
                    className={`bg-white p-2 min-h-[60px] flex flex-col cursor-pointer transition hover:bg-gray-750 ${day.isCurrentMonth ? '' : 'bg-white/50'} ${isSelected ? 'ring-2 ring-blue-500/50' : ''}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isSelected ? 'bg-emerald-600 text-gray-900 font-bold' : day.isCurrentMonth ? 'text-gray-600' : 'text-gray-600'}`}>
                        {day.date}
                      </span>
                    </div>
                    <div className="space-y-1 overflow-y-auto flex-1 no-scrollbar">
                      {matches.slice(0, 2).map((evt, eIdx) => (
                        <div key={eIdx} className={`p-1 rounded text-[9px] leading-tight ${getEventStyles(evt.type)}`}>
                          <span className="font-bold truncate block">{evt.title}</span>
                        </div>
                      ))}
                      {matches.length > 2 && (
                        <div className="text-[8px] text-emerald-600 font-semibold mt-0.5">+{matches.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {view === 'week' && (
        <>
          <div className="grid grid-cols-7 border-b border-gray-200 bg-white/50">
            {daysOfWeek.map(day => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{day}</div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 bg-gray-100 gap-[1px]">
            {activeWeek.map((day, dIdx) => {
              const matches = dbEvents.filter(evt => day.isCurrentMonth && evt.day === day.date);
              const isSelected = day.isCurrentMonth && day.date === selectedDay;
              return (
                <div 
                  key={dIdx} 
                  onClick={() => day.isCurrentMonth && setSelectedDay(day.date)}
                  className={`bg-white p-3 min-h-[300px] flex flex-col cursor-pointer transition hover:bg-gray-750 ${day.isCurrentMonth ? '' : 'bg-white/50'} ${isSelected ? 'ring-2 ring-blue-500/50' : ''}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isSelected ? 'bg-emerald-600 text-gray-900 font-bold' : day.isCurrentMonth ? 'text-gray-600' : 'text-gray-600'}`}>
                      {day.date}
                    </span>
                  </div>
                  <div className="space-y-1.5 overflow-y-auto flex-1 no-scrollbar">
                    {matches.map((evt, eIdx) => (
                      <div key={eIdx} className={`p-1.5 rounded text-[10px] leading-tight ${getEventStyles(evt.type)}`}>
                        <span className="font-bold block">{evt.time}</span>
                        <span className="font-semibold truncate block">{evt.title}</span>
                        <span className="truncate opacity-85 block">{evt.subtitle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {view === 'day' && (
        <div className="flex-1 p-6 bg-gray-850 overflow-y-auto">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Scheduled Activities for July {selectedDay}, 2026
          </h3>
          {dayEvents.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-20">No activities scheduled for this day.</div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((evt, idx) => (
                <div key={evt.id || idx} className="p-4 bg-white border border-gray-750 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-emerald-600">10:00 AM</span>
                      <span className="text-gray-600 text-xs">|</span>
                      <span className="font-semibold text-gray-800">{evt.customer || 'Walk-in'}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Product: <span className="text-gray-600 font-medium">{evt.product}</span> ({evt.quantity} units @ ₹{evt.price.toLocaleString()})
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Representative: {evt.rep}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-sm font-extrabold text-green-400">₹{evt.total.toLocaleString()}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">{evt.method} ({evt.status})</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'list' && (
        <div className="flex-1 p-6 bg-gray-850 overflow-y-auto">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            Scheduled Transactions & Events
          </h3>
          {allEventsList.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-20">No scheduled activities.</div>
          ) : (
            <div className="space-y-3">
              {allEventsList.map((evt, idx) => (
                <div key={evt.id || idx} className="p-3 bg-white border border-gray-755 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-600">
                      {evt.date ? new Date(evt.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{evt.customer || 'Walk-in'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Representative: {evt.rep} | Product: {evt.product}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${evt.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {evt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center text-xs">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-gray-500"><div className="w-2.5 h-2.5 rounded bg-emerald-500"></div> Meetings (Paid)</div>
          <div className="flex items-center gap-1.5 text-gray-500"><div className="w-2.5 h-2.5 rounded bg-green-500"></div> Follow-ups (Pending)</div>
        </div>
      </div>
    </div>
  );
};

export default MainCalendarGrid;





