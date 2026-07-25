// frontend/src/components/layout/Sidebar.jsx
import React, { useState, useEffect, memo } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import {Home, Package, BarChart2, Users, IndianRupee, ChartArea, Menu, ChevronLeft, Calendar, Bell, Settings} from "lucide-react";

// Color mappings for icon highlights
const COLOR_MAP = {
  blue: "text-blue-400", green: "text-green-400", purple: "text-purple-400",
  orange: "text-orange-400", teal: "text-teal-400", cyan: "text-cyan-400",
};

// Navigation menu configuration
const NAV_ITEMS = [
  { icon: Home, label: "Dashboard", path: "/dashboard", color: "cyan" },
  { icon: BarChart2, label: "Daily Sales", path: "/daily-sales", color: "blue" },
  { icon: ChartArea, label: "Sales History", path: "/sales", color: "green" },
  { icon: Users, label: "Sales Executives", path: "/employees", color: "purple" },
  { icon: Users, label: "Customers", path: "/customers", color: "orange" },
  { icon: ChartArea, label: "Reports", path: "/reports", color: "teal" },
  { icon: Package, label: "Products / Services", path: "/inventory", color: "blue" },
  { icon: Calendar, label: "Calendar", path: "/calendar", color: "purple" },
  { icon: Bell, label: "Notifications", path: "/notifications", color: "orange" },
  { icon: Settings, label: "Settings", path: "/settings", color: "gray" },
];

// 🔹 Single NavItem component for reusability & clean structure
const NavItem = memo(({ item, isActive, isExpanded }) => {
  const { icon: Icon, label, path, color, badge } = item;
  return (
    <Link
      to={path}
      title={!isExpanded ? label : ""}
      className={`
        flex items-center justify-between px-4 py-3 text-gray-300 transition-all duration-300 
        hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white group relative overflow-hidden
        ${isActive ? "bg-gradient-to-r from-gray-800/50 to-gray-700/50 text-white border-l-4 border-blue-500" : ""}
      `}
    >
      {/* Hover shimmer effect for nav item */}
      <div className="absolute inset-0 transition-all duration-1000 ease-in-out transform -translate-x-full opacity-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent group-hover:translate-x-full group-hover:opacity-100" />
      
      <div className="flex items-center z-10 relative">
        {/* Nav icon */}
        <Icon
          size={20}
          className={`
            transition-all duration-300 relative z-10 
            ${COLOR_MAP[color] || "text-gray-300"} 
            ${!isExpanded ? "mx-auto scale-100 group-hover:scale-110" : "mr-3 group-hover:translate-x-1"}
          `}
        />

        {/* Nav label */}
        <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out relative z-10 
          ${isExpanded ? "w-32 opacity-100" : "w-0 opacity-0"}`}>
          {label}
        </span>
      </div>

      {/* Render optional Badge */}
      {badge > 0 && isExpanded && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 relative">
          {badge}
        </span>
      )}
    </Link>
  );
});

// 🔹 Main Sidebar Component
const Sidebar = ({ updateSidebarState }) => {
  const location = useLocation();

  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);   // Sidebar collapsed state
  const [isHovered, setIsHovered] = useState(false);       // Hover state to auto-expand on hover
  const isExpanded = !isCollapsed || isHovered;            // Expanded if manually or temporarily via hover
  
  const [unreadCount, setUnreadCount] = useState(() => {
    const saved = localStorage.getItem('unread_notifications_count');
    return saved !== null ? parseInt(saved, 10) : 5;
  });
  const [businessName, setBusinessName] = useState("Akshara Sales");

  useEffect(() => {
    const loadBusiness = () => {
      const saved = localStorage.getItem("settings_business");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.businessName) {
            setBusinessName(parsed.businessName);
          }
        } catch (e) {}
      }
    };
    loadBusiness();
    window.addEventListener("business_settings_updated", loadBusiness);
    return () => window.removeEventListener("business_settings_updated", loadBusiness);
  }, []);

  useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem('unread_notifications_count');
      if (saved !== null) {
        setUnreadCount(parseInt(saved, 10));
      }
    };
    
    updateCount();
    window.addEventListener('notifications_updated', updateCount);
    return () => window.removeEventListener('notifications_updated', updateCount);
  }, []);

  // Notify parent about sidebar width change
  useEffect(() => {
    updateSidebarState?.(isExpanded ? "w-64" : "w-16");
  }, [isExpanded, updateSidebarState]);

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = loggedInUser.role === "admin";

  const items = NAV_ITEMS.filter(item => {
    // Hide Admin-only features from normal employees
    if (!isAdmin && (item.path === "/reports" || item.path === "/employees")) {
      return false;
    }
    return true;
  }).map(item => {
    // Prefix path with /admin for Super Admins
    const path = isAdmin ? `/admin${item.path}` : item.path;
    const badge = item.label === "Notifications" ? unreadCount : undefined;
    return { ...item, path, badge };
  });

  return (
    <aside
      className={`fixed h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-[4px_0_10px_-3px_rgba(0,0,0,0.3)] z-20 transition-all duration-300 ease-in-out flex flex-col justify-between
        ${isExpanded ? "w-64" : "w-16"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/*Sidebar Top Logo & Toggle Button */}
      <div className="relative flex items-center justify-between p-4 overflow-hidden border-b border-gray-700/50 shrink-0">
        {/* Brand Title */}
        <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? "w-40 opacity-100" : "w-0 opacity-0"}`}>
          <h2 className="text-xl font-bold text-white truncate" title={businessName}>
            {(() => {
              if (!businessName) return "";
              const parts = businessName.split(' ');
              if (parts[0].length <= 3 && parts[1]) {
                return `${parts[0]} ${parts[1]}`;
              }
              return parts[0];
            })()}
          </h2>
        </div>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-10 h-10 text-gray-300 transition-all duration-300 rounded-full"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            
          {isCollapsed && !isHovered ? (
            <Menu size={20} className="transition-transform duration-300 hover:rotate-90" />
          ) : (
            <ChevronLeft size={20} className="transition-transform duration-300 hover:-translate-x-1" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-1 mt-6 overflow-y-auto no-scrollbar">
        {items.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isActive={location.pathname === item.path}
            isExpanded={isExpanded}
          />
        ))}
      </nav>

      {/* Logout Button */}
      <div className="w-full px-2 pb-4 mt-auto shrink-0">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-red-400 hover:text-red-300 transition-all duration-300 hover:bg-red-500/10 rounded-lg group relative overflow-hidden cursor-pointer"
          title={!isExpanded ? "Logout" : ""}
        >
          <LogOut size={20} className={!isExpanded ? "mx-auto" : "mr-3"} />
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? "w-32 opacity-100" : "w-0 opacity-0"}`}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default memo(Sidebar);
