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
    toast.warning("Cleared all notifications.");
  };

  if (loading) return <SkeletonPageFallback />;

  return (
    <div className="flex flex-col min-h-screen text-gray-100 transition-all duration-200 bg-gray-900 animate-fadeIn overflow-hidden">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Notifications</h1>
            <p className="text-gray-400 text-sm">Stay updated with important alerts and activities</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleMarkAllRead}
              className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-gray-700 transition"
            >
              <CheckSquare className="w-4 h-4 mr-2" /> Mark all as read
            </button>
            <button 
              onClick={handleClearAll}
              className="bg-gray-800 border border-gray-700 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-red-500/10 transition"
            >
              Clear all
            </button>
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
