import React from 'react';
import { Bell } from 'lucide-react';

const NotificationSummary = ({ notifications = [] }) => {
  const unreadCount = notifications.filter(n => n.isUnread).length;
  const readCount = notifications.length - unreadCount;

  return (
    <div className="glass-card-elevated p-5 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm">Notification Summary</h3>
      
      <div className="flex items-center gap-6 mb-2">
        <div className="relative shrink-0 w-16 h-16 bg-emerald-600/10 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-500/20">
          <Bell size={32} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-gray-900 text-xs font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex-1 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Total
            </span>
            <span className="font-bold text-gray-200">{notifications.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Unread
            </span>
            <span className="font-bold text-red-400">{unreadCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Read
            </span>
            <span className="font-bold text-gray-200">{readCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSummary;





