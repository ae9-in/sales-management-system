import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MiniCalendarWidget = ({ selectedDay = 19, setSelectedDay }) => {
  // Calendar base days for July 2026
  const gridDays = [
    { date: 28, isCurrentMonth: false }, { date: 29, isCurrentMonth: false }, { date: 30, isCurrentMonth: false },
    { date: 1, isCurrentMonth: true }, { date: 2, isCurrentMonth: true }, { date: 3, isCurrentMonth: true }, { date: 4, isCurrentMonth: true },
    { date: 5, isCurrentMonth: true }, { date: 6, isCurrentMonth: true }, { date: 7, isCurrentMonth: true }, { date: 8, isCurrentMonth: true }, { date: 9, isCurrentMonth: true }, { date: 10, isCurrentMonth: true }, { date: 11, isCurrentMonth: true },
    { date: 12, isCurrentMonth: true }, { date: 13, isCurrentMonth: true }, { date: 14, isCurrentMonth: true }, { date: 15, isCurrentMonth: true }, { date: 16, isCurrentMonth: true }, { date: 17, isCurrentMonth: true }, { date: 18, isCurrentMonth: true },
    { date: 19, isCurrentMonth: true }, { date: 20, isCurrentMonth: true }, { date: 21, isCurrentMonth: true }, { date: 22, isCurrentMonth: true }, { date: 23, isCurrentMonth: true }, { date: 24, isCurrentMonth: true }, { date: 25, isCurrentMonth: true },
    { date: 26, isCurrentMonth: true }, { date: 27, isCurrentMonth: true }, { date: 28, isCurrentMonth: true }, { date: 29, isCurrentMonth: true }, { date: 30, isCurrentMonth: true }, { date: 31, isCurrentMonth: true },
    { date: 1, isCurrentMonth: false }
  ];

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl mb-6">
      <h3 className="font-semibold text-gray-100 mb-4 text-sm">Mini Calendar</h3>
      
      <div className="flex justify-between items-center mb-4">
          <button className="p-1 text-gray-400 hover:text-white"><ChevronLeft size={16} /></button>
          <span className="text-sm font-semibold text-gray-200">July 2026</span>
          <button className="p-1 text-gray-400 hover:text-white"><ChevronRight size={16} /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-gray-500 font-medium py-1">{d}</div>)}
      </div>
      
      <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-xs">
          {gridDays.map((day, idx) => {
            const isTodayHighlight = day.isCurrentMonth && day.date === selectedDay;
            return (
              <div 
                key={idx}
                onClick={() => {
                  if (day.isCurrentMonth && setSelectedDay) {
                    setSelectedDay(day.date);
                  }
                }}
                className={`py-1 rounded cursor-pointer transition ${
                  isTodayHighlight 
                    ? 'bg-blue-600 text-white font-bold' 
                    : day.isCurrentMonth 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-600'
                }`}
              >
                {day.date}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MiniCalendarWidget;
