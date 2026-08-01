import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../utils/toastConfig";
import { Calendar, CheckSquare } from "lucide-react";
import { fetchSales, fetchInventory } from "../services/api";

import NotificationList from "../components/notifications/NotificationList";
import NotificationSummary from "../components/notifications/NotificationSummary";
import NotificationQuickFilters from "../components/notifications/NotificationQuickFilters";
import NotificationPreferencesWidget from "../components/notifications/NotificationPreferencesWidget";
import { SkeletonPageFallback } from "../components/common/Skeleton";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [clearStatus, setClearStatus] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const [salesData, inventoryData] = await Promise.all([
          fetchSales(),
          fetchInventory()
        ]);

        const derived = [];
        
        // 1. Low stock alerts
        inventoryData.forEach(item => {
          if (item.currentStock <= item.reorderLevel) {
            derived.push({
              id: `stock-${item.id}`,
              type: 'stock-alert',
              title: 'Low Stock Alert',
              tag: 'System Alert',
              description: `Stock level of ${item.name} is low: current level ${item.currentStock} (Reorder limit: ${item.reorderLevel}).`,
              category: 'System',
              time: 'System Alert',
              isUnread: true
            });
          }
        });

        // 2. Payments & Sales
        salesData.forEach(s => {
          if (s.status !== 'Paid') {
            derived.push({
              id: `sale-pending-${s.id}`,
              type: 'payment-pending',
              title: 'Payment Pending',
              tag: 'High Priority',
              description: `Payment of ₹${s.total.toLocaleString()} from ${s.customer || 'Walk-in'} is pending for item ${s.product}.`,
              category: 'Payments',
              time: 'Payment Alert',
              isUnread: true
            });
          } else {
            derived.push({
              id: `sale-paid-${s.id}`,
              type: 'sale-added',
              title: 'New Sale Added',
              tag: '',
              description: `${s.rep || 'Sales Exec'} added a new sale worth ₹${s.total.toLocaleString()} for customer ${s.customer || 'Walk-in'}.`,
              category: 'Sales',
              time: 'Sales Alert',
              isUnread: true
            });
          }
        });

        // Check if there is local read/unread or hidden status stored
        const savedRead = localStorage.getItem("read_notification_ids");
        const readIds = savedRead ? JSON.parse(savedRead) : {};

        const savedHidden = localStorage.getItem("hidden_notification_ids");
        const hiddenIds = savedHidden ? JSON.parse(savedHidden) : [];

        const filtered = derived
          .filter(n => !hiddenIds.includes(n.id))
          .map(n => ({
            ...n,
            isUnread: readIds[n.id] === undefined ? true : readIds[n.id]
          }));

        setNotifications(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  useEffect(() => {
    const unread = notifications.filter(n => n.isUnread).length;
    localStorage.setItem('unread_notifications_count', String(unread));
    window.dispatchEvent(new Event('notifications_updated'));
  }, [notifications]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
    const savedRead = localStorage.getItem("read_notification_ids");
    const readIds = savedRead ? JSON.parse(savedRead) : {};
    notifications.forEach(n => {
      readIds[n.id] = false;
    });
    localStorage.setItem("read_notification_ids", JSON.stringify(readIds));
    toast.success("All notifications marked as read!");
  };

  const handleToggleRead = (id) => {
    const updated = notifications.map(n => {
      if (n.id === id) {
        const nextState = !n.isUnread;
        toast.info(nextState ? "Marked as unread" : "Marked as read");
        return { ...n, isUnread: nextState };
      }
      return n;
    });
    setNotifications(updated);
    
    const savedRead = localStorage.getItem("read_notification_ids");
    const readIds = savedRead ? JSON.parse(savedRead) : {};
    readIds[id] = !readIds[id];
    localStorage.setItem("read_notification_ids", JSON.stringify(readIds));
  };

  const handleClearAll = () => {
    setNotifications([]);
    const savedHidden = localStorage.getItem("hidden_notification_ids");
    const hiddenIds = savedHidden ? JSON.parse(savedHidden) : [];
    notifications.forEach(n => {
      if (!hiddenIds.includes(n.id)) {
        hiddenIds.push(n.id);
      }
    });
    localStorage.setItem("hidden_notification_ids", JSON.stringify(hiddenIds));
    setClearStatus("Cleared all notifications.");
    setTimeout(() => setClearStatus(""), 3000);
  };

  if (loading) return <SkeletonPageFallback />;

  return (
    <div className="flex flex-col min-h-screen text-gray-900 transition-all duration-200 bg-white animate-fadeIn overflow-hidden">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Notifications</h1>
            <p className="text-gray-500 text-sm">Stay updated with important alerts and activities</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center relative">
            {clearStatus && (
              <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded border border-orange-400/20 animate-fadeIn mr-2">
                {clearStatus}
              </span>
            )}
            <button 
              onClick={handleMarkAllRead}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-gray-100 transition"
            >
              <CheckSquare className="w-4 h-4 mr-2" /> Mark all as read
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowConfirmClear(!showConfirmClear)}
                className="bg-white border border-gray-200 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-red-500/10 transition"
              >
                Clear all
              </button>
              {showConfirmClear && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-lg p-3 shadow-xl w-48 text-xs">
                  <p className="text-gray-600 mb-2 font-medium text-center">Clear all notifications?</p>
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={() => setShowConfirmClear(false)}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-600 rounded text-gray-600"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        handleClearAll();
                        setShowConfirmClear(false);
                      }}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-gray-900 font-semibold"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          
          {/* Left Column */}
          <div className="col-span-1 xl:col-span-9 flex flex-col">
            <NotificationList 
              notifications={notifications} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              onToggleRead={handleToggleRead}
            />
          </div>

          {/* Right Column */}
          <div className="col-span-1 xl:col-span-3 flex flex-col">
            <NotificationSummary notifications={notifications} />
            <NotificationQuickFilters 
              notifications={notifications} 
              onSelectFilter={setActiveTab} 
            />
            <NotificationPreferencesWidget />
          </div>

        </div>

      </main>
      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default Notifications;

