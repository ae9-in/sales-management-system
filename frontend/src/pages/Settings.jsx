import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../utils/toastConfig";
import { HelpCircle } from "lucide-react";

import SettingsSidebar from "../components/settings/SettingsSidebar";
import GeneralSettingsForm from "../components/settings/GeneralSettingsForm";
import BusinessSettingsForm from "../components/settings/BusinessSettingsForm";
import SystemPreferencesForm from "../components/settings/SystemPreferencesForm";
import SettingsQuickActions from "../components/settings/SettingsQuickActions";
import SettingsAccountSummary from "../components/settings/SettingsAccountSummary";
import AppSettingsForm from "../components/settings/AppSettingsForm";
import UserManagement from "../components/settings/UserManagement";

const Settings = () => {
  const [activeMenu, setActiveMenu] = useState("General");
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);

  return (
    <div className="flex flex-col min-h-screen text-gray-900 transition-all duration-200 page-bg animate-fadeIn overflow-hidden">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        
        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Settings</h1>
            <p className="text-gray-500 text-sm">Manage your account, preferences and system settings</p>
          </div>
          <div className="relative">
            <button 
              onClick={() => toast.info("Help: All settings and configurations are persisted in your local browser storage.")}
              onMouseEnter={() => setShowHelpTooltip(true)}
              onMouseLeave={() => setShowHelpTooltip(false)}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm flex items-center hover:bg-gray-100 transition"
            >
              <HelpCircle className="w-4 h-4 mr-2" /> Help
            </button>
            {showHelpTooltip && (
              <div className="absolute right-0 z-50 p-3 mt-2 text-xs text-gray-800 bg-white border border-gray-200 rounded-lg shadow-xl top-full w-64 backdrop-blur-sm animate-fadeIn">
                All settings and configurations are persisted in your local browser storage.
              </div>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
          
          {/* Left Sub-nav */}
          <div className="col-span-1 xl:col-span-3 flex flex-col">
            <SettingsSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
          </div>

          {/* Center Forms */}
          <div className="col-span-1 xl:col-span-6 flex flex-col gap-6">
            {activeMenu === "General" && <GeneralSettingsForm />}
            {activeMenu === "Company" && <BusinessSettingsForm />}
            {activeMenu === "User Management" && <UserManagement />}
            {(activeMenu !== "General" && activeMenu !== "Company" && activeMenu !== "Security" && activeMenu !== "User Management") && (
              <SystemPreferencesForm />
            )}
            {activeMenu === "Security" && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-3">Security & Password</h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-gray-500 mb-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500" disabled />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-800 outline-none focus:border-emerald-500" disabled />
                  </div>
                  <button 
                    onClick={() => toast.warning("Authentication is environment-variable based. To update the admin password, please modify ADMIN_PASSWORD_HASH in the backend .env configuration.")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-gray-900 font-semibold px-4 py-2 rounded text-xs transition"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Widgets */}
          <div className="col-span-1 xl:col-span-3 flex flex-col">
            <SettingsQuickActions onNavigate={setActiveMenu} />
            <SettingsAccountSummary />
            <AppSettingsForm />
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-wrap justify-between items-center text-xs text-gray-500 gap-4">
          <span>© 2026 SalesTrack Solutions Pvt. Ltd. All rights reserved.</span>
          <div className="flex gap-4">
            <button onClick={() => toast.info("Privacy Policy is not configured for this local instance.")} className="hover:text-gray-500 transition bg-transparent border-none outline-none">Privacy Policy</button>
            <button onClick={() => toast.info("Terms of Service are not configured for this local instance.")} className="hover:text-gray-500 transition bg-transparent border-none outline-none">Terms of Service</button>
          </div>
        </div>

      </main>
      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default Settings;



