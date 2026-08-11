import React from "react";
import { ToastContainer } from "react-toastify";
import { toastConfig } from "../utils/toastConfig";
import UserManagement from "../components/settings/UserManagement";

const UserManagementPage = () => {
  return (
    <div className="flex flex-col min-h-screen text-gray-900 transition-all duration-200 page-bg animate-fadeIn overflow-hidden">
      <main className="flex-1 w-full max-w-screen-2xl p-4 md:p-6 mx-auto overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">User Management</h1>
          <p className="text-gray-500 text-sm">Manage user accounts, approve admins, and revoke access.</p>
        </div>

        {/* Content */}
        <div className="mb-8">
          <UserManagement />
        </div>
      </main>
      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default UserManagementPage;
