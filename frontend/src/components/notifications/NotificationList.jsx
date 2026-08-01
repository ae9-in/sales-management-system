import React from 'react';
import { CreditCard, ArrowUpRight, UserCheck, Share2, Calendar, ShieldAlert, Award, FileSpreadsheet, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const getIcon = (type) => {
  switch (type) {
    case 'payment-pending': return { icon: CreditCard, color: 'text-red-400 bg-red-500/10' };
    case 'sale-added': return { icon: ArrowUpRight, color: 'text-green-400 bg-green-500/10' };
    case 'followup': return { icon: Share2, color: 'text-purple-400 bg-purple-500/10' };
    case 'quotation': return { icon: Share2, color: 'text-orange-400 bg-orange-500/10' };
    case 'meeting': return { icon: Calendar, color: 'text-emerald-600 bg-emerald-500/10' };
    case 'payment-received': return { icon: Award, color: 'text-yellow-400 bg-yellow-500/10' };
    case 'stock-alert': return { icon: ShieldAlert, color: 'text-emerald-600 bg-emerald-500/10' };
    case 'customer-added': return { icon: UserCheck, color: 'text-pink-400 bg-pink-500/10' };
    case 'report-ready': return { icon: FileSpreadsheet, color: 'text-gray-500 bg-gray-500/10' };
    case 'task-completed': return { icon: Check, color: 'text-green-400 bg-green-500/10' };
    default: return { icon: CreditCard, color: 'text-gray-500 bg-gray-500/10' };
  }
};

const NotificationList = ({ notifications = [], activeTab, setActiveTab, onToggleRead }) => {
  
  // Calculate counts for tabs
  const getCount = (name) => {
    if (name === 'All') return notifications.length;
    if (name === 'Unread') return notifications.filter(n => n.isUnread).length;
    return notifications.filter(n => n.category === name).length;
  };

  const tabs = [
    { name: 'All', count: getCount('All') },
    { name: 'Unread', count: getCount('Unread') },
    { name: 'Sales', count: getCount('Sales') },
    { name: 'Payments', count: getCount('Payments') },
    { name: 'Follow-ups', count: getCount('Follow-ups') },
    { name: 'System', count: getCount('System') },
  ];

  // Filter list
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return n.isUnread;
    return n.category === activeTab;
  });

  return (
    <div className="glass-card-elevated p-4 flex-1 flex flex-col overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 mb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(tab.name)}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === tab.name
                ? 'text-emerald-600 border-blue-400'
                : 'text-gray-500 border-transparent hover:text-gray-200'
            }`}
          >
            {tab.name}
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === tab.name ? 'bg-emerald-600/20 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pr-1">
        {filteredNotifications.map((notif) => {
          const { icon: Icon, color } = getIcon(notif.type);
          return (
            <div
              key={notif.id}
              onClick={() => onToggleRead(notif.id)}
              className={`p-4 rounded-xl border flex items-start gap-4 transition cursor-pointer hover:bg-gray-100/20 ${
                notif.isUnread
                  ? 'bg-gray-100/20 border-gray-200/50'
                  : 'bg-transparent border-gray-200/20'
              }`}
            >
              <div className={`p-2.5 rounded-lg ${color} shrink-0`}>
                <Icon size={18} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="text-sm font-semibold text-gray-200">{notif.title}</h4>
                  {notif.tag && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400">
                      {notif.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{notif.description}</p>
                {notif.action && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info(`Opening action panel: ${notif.action}`);
                    }}
                    className="border border-gray-200 bg-transparent hover:bg-gray-100 text-gray-200 text-xs px-3 py-1.5 rounded-lg transition font-medium"
                  >
                    {notif.action}
                  </button>
                )}
              </div>

              <div className="flex flex-col items-end justify-between shrink-0 gap-2">
                <span className="text-[10px] text-gray-500 whitespace-nowrap">{notif.time}</span>
                {notif.isUnread && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                {!notif.isUnread && <div className="w-2 h-2 rounded-full bg-gray-600"></div>}
              </div>
            </div>
          );
        })}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-xs">No notifications in this category.</div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;





