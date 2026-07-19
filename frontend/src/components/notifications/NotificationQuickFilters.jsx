import React from 'react';

const NotificationQuickFilters = ({ notifications = [], onSelectFilter }) => {
  const getCount = (category) => {
    if (category === 'All') return notifications.length;
    return notifications.filter(n => n.category === category).length;
  };

  const filters = [
    { name: 'Payment Alerts', category: 'Payments', symbol: '₹', color: 'text-red-400 bg-red-500/10' },
    { name: 'Follow-up Reminders', category: 'Follow-ups', symbol: '👤', color: 'text-purple-400 bg-purple-500/10' },
    { name: 'Sales Updates', category: 'Sales', symbol: '📈', color: 'text-green-400 bg-green-500/10' },
    { name: 'System Notifications', category: 'System', symbol: '⚙️', color: 'text-blue-400 bg-blue-500/10' },
    { name: 'All Notifications', category: 'All', symbol: '📋', color: 'text-gray-400 bg-gray-500/10' },
  ];

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl mb-6">
      <h3 className="font-semibold text-gray-100 mb-4 text-sm">Quick Filters</h3>
      <div className="space-y-3">
        {filters.map((f, i) => (
          <div 
            key={i} 
            onClick={() => onSelectFilter(f.category)}
            className="flex justify-between items-center text-sm cursor-pointer hover:bg-gray-700/30 p-1.5 rounded transition"
          >
              <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${f.color}`}>
                      {f.symbol}
                  </div>
                  <span className="text-gray-300 text-xs">{f.name}</span>
              </div>
              <span className="text-gray-500 text-xs font-semibold">{getCount(f.category)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationQuickFilters;
