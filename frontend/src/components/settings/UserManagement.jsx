import React, { useState, useEffect } from "react";
import { Users, UserX, ShieldCheck, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error(error.response?.data?.message || "Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser.id) {
      toast.error("You cannot suspend your own account.");
      return;
    }

    const nextStatus = user.status === "active" ? "suspended" : "active";
    try {
      await api.put(`/users/${user.id}`, {
        role: user.role,
        status: nextStatus
      });
      toast.success(`User status updated to ${nextStatus}.`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user status.");
    }
  };

  const handleToggleRole = async (user) => {
    if (user.id === currentUser.id) {
      toast.error("You cannot change your own role.");
      return;
    }

    const nextRole = user.role === "admin" ? "employee" : "admin";
    try {
      await api.put(`/users/${user.id}`, {
        role: nextRole,
        status: user.status
      });
      toast.success(`User role updated to ${nextRole}.`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user role.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      toast.error("You cannot delete your own account.");
      return;
    }

    if (!window.confirm("Are you sure you want to permanently delete this user?")) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500 py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        Loading users...
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
        <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Users size={16} className="text-emerald-600" /> User Management
        </h3>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-semibold">
          {users.length} Users Registered
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 font-medium">
              <th className="py-3 px-2">Username</th>
              <th className="py-3 px-2">Email</th>
              <th className="py-3 px-2 text-center">Role</th>
              <th className="py-3 px-2 text-center">Status</th>
              <th className="py-3 px-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {users.map((u) => {
              const isSelf = u.id === currentUser.id;
              return (
                <tr key={u.id} className={`hover:bg-gray-100/20 ${isSelf ? "bg-emerald-500/5" : ""}`}>
                  <td className="py-3 px-2 font-semibold text-gray-200">
                    {u.username} {isSelf && <span className="text-[9px] text-emerald-600 font-normal ml-1.5">(You)</span>}
                  </td>
                  <td className="py-3 px-2 text-gray-500">{u.email}</td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        u.role === "admin"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        u.status === "active"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex justify-center gap-2">
                      {/* Toggle Role Button */}
                      <button
                        onClick={() => handleToggleRole(u)}
                        disabled={isSelf}
                        title={u.role === "admin" ? "Demote to Employee" : "Promote to Admin"}
                        className={`p-1.5 rounded transition ${
                          isSelf
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-purple-400 hover:bg-purple-500/10"
                        }`}
                      >
                        {u.role === "admin" ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                      </button>

                      {/* Toggle Status Button */}
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={isSelf}
                        title={u.status === "active" ? "Suspend Account" : "Activate Account"}
                        className={`p-1.5 rounded transition ${
                          isSelf
                            ? "text-gray-600 cursor-not-allowed"
                            : u.status === "active"
                            ? "text-yellow-400 hover:bg-yellow-500/10"
                            : "text-green-400 hover:bg-green-500/10"
                        }`}
                      >
                        <UserX size={14} />
                      </button>

                      {/* Delete User Button */}
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={isSelf}
                        title="Delete User"
                        className={`p-1.5 rounded transition ${
                          isSelf
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-red-400 hover:bg-red-500/10"
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;


