// frontend/src/pages/Login.jsx - Redesigned premium Authentication page component
import React, { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { showToast, toastConfig } from "../utils/toastConfig";
import { useAuth } from "../hooks/useAuth";
import { Mail, Lock, Shield, ArrowRight, HelpCircle, Sparkles, Eye, EyeOff, Building } from "lucide-react";

// Lazy load non-critical resources
const HelpModal = lazy(() => import("../components/feedback/HelpModal"));

// Import styles only when needed
const loadToastStyles = () => import("react-toastify/dist/ReactToastify.css");

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [state, setState] = useState({ showHelpModal: false, isSubmitting: false });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("employee"); // "employee" or "admin"

  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();

  const isAdminPortal = location.pathname === "/admin/login";

  useEffect(() => {
    loadToastStyles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      showToast.error("Please enter both email and password");
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const result = await login(formData);

      if (result.success) {
        const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
        
        if (isAdminPortal) {
          if (loggedInUser.role === "superadmin") {
            showToast.success(`Welcome back, ${loggedInUser.username}! Redirecting to Super Admin Portal...`);
            setTimeout(() => navigate("/admin/dashboard"), 1000);
          } else {
            logout();
            showToast.error("Unauthorized. Only Super Admins can log in via this portal.");
            setFormData((prev) => ({ ...prev, password: "" }));
          }
        } else {
          if (activeTab === "admin") {
            if (loggedInUser.role === "admin") {
              showToast.success(`Welcome back, ${loggedInUser.username}! Redirecting to Admin Portal...`);
              setTimeout(() => navigate("/admin/dashboard"), 1000);
            } else {
              logout();
              showToast.error("Unauthorized. Only Admins can log in via this tab.");
              setFormData((prev) => ({ ...prev, password: "" }));
            }
          } else {
            if (loggedInUser.role === "employee") {
              showToast.success(`Welcome back, ${loggedInUser.username}! Redirecting...`);
              setTimeout(() => navigate("/dashboard"), 1000);
            } else {
              logout();
              showToast.error("Unauthorized. Only Employees can log in via this tab.");
              setFormData((prev) => ({ ...prev, password: "" }));
            }
          }
        }
      } else {
        showToast.error(result.message || "Invalid email or password");
        setFormData((prev) => ({ ...prev, password: "" }));
      }
    } catch (error) {
      showToast.error("An error occurred. Please try again.");
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleKeyPress = (e, field) => {
    if (e.key === "Enter") {
      if (field === "email") {
        e.preventDefault();
        document.querySelector('input[name="password"]').focus();
      } else if (field === "password") {
        e.preventDefault();
        handleLogin();
      }
    }
  };

  const handlePortalSwitch = (isAdmin) => {
    setFormData({ email: "", password: "" });
    navigate(isAdmin ? "/admin/login" : "/");
  };

  return (
    <div className="relative flex flex-col justify-center min-h-screen text-gray-100 bg-slate-950 overflow-hidden font-sans">
      {/* 🚀 Custom Premium Inline Styles for Background Blobs */}
      <style>{`
        @keyframes float-blob-1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float-blob-2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-40px, 40px) scale(1.05); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob-1 {
          animation: float-blob-1 12s infinite ease-in-out;
        }
        .animate-blob-2 {
          animation: float-blob-2 16s infinite ease-in-out;
        }
        .glass-login-card {
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
        }
      `}</style>

      {/* 🔮 Background Animated Light Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none animate-blob-1" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-teal-500/10 blur-[130px] pointer-events-none animate-blob-2" />

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl p-4 md:p-8 mx-auto">
        <div className="w-full max-w-md p-8 md:p-10 rounded-2xl glass-login-card transition-all duration-300 hover:border-slate-700/60">
          
          {/* Header Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 mb-3 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20">
              <Building className="w-6 h-6 text-slate-950 stroke-[2]" />
            </div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              {isAdminPortal ? "Super Admin Portal" : "Akshara Staff Portal"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isAdminPortal 
                ? "Management & Approvals" 
                : activeTab === "admin" 
                ? "Admin Login Portal" 
                : "Employee Login Portal"}
            </p>
          </div>

          {/* 🎛️ Segmented Slide Control for Portal Switching (Employee vs Admin on Staff Portal) */}
          {!isAdminPortal && (
            <div className="relative flex p-1 mb-8 bg-slate-900/80 border border-slate-800/80 rounded-xl">
              {/* Sliding Highlight Indicator */}
              <div
                className={`absolute top-1 bottom-1 w-[48%] bg-gradient-to-r from-emerald-600/80 to-teal-600/80 rounded-lg transition-all duration-300 ease-out ${
                  activeTab === "admin" ? "left-[50.5%]" : "left-1"
                }`}
              />
              
              {/* Employee Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("employee")}
                className={`relative z-10 flex-1 py-2 text-xs font-semibold text-center transition-colors duration-200 cursor-pointer ${
                  activeTab === "employee" ? "text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Employee Portal
              </button>

              {/* Admin Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={`relative z-10 flex-1 py-2 text-xs font-semibold text-center transition-colors duration-200 cursor-pointer ${
                  activeTab === "admin" ? "text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Admin Portal
              </button>
            </div>
          )}

          {/* Title & Portal Badge */}
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-lg font-bold text-slate-100">
              {isAdminPortal 
                ? "Super Admin Sign In" 
                : activeTab === "admin" 
                ? "Admin Sign In" 
                : "Employee Sign In"}
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-slate-800 border border-slate-700 text-emerald-400">
              <Sparkles size={8} /> 
              {isAdminPortal 
                ? "Super Admin" 
                : activeTab === "admin" 
                ? "Admin" 
                : "Employee"}
            </span>
          </div>

          {/* Login Fields */}
          <div className="space-y-4">
            {/* Email Field */}
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyPress(e, "email")}
                autoComplete="email"
                required
                className="w-full pl-11 pr-4 py-3.5 text-xs text-slate-200 transition-all duration-300 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-slate-600 hover:border-slate-700"
              />
            </div>

            {/* Password Field */}
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyPress(e, "password")}
                autoComplete="current-password"
                required
                className="w-full pl-11 pr-11 py-3.5 text-xs text-slate-200 transition-all duration-300 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-slate-600 hover:border-slate-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={state.isSubmitting}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 mt-4 font-bold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all duration-300 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] cursor-pointer ${
                state.isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {state.isSubmitting ? "Signing in..." : "Sign In"}
              {!state.isSubmitting && <ArrowRight size={14} />}
            </button>
          </div>

          {/* Bottom Links */}
          <div className="mt-8 text-center flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, showHelpModal: true }))}
              className="text-slate-500 text-xs transition-colors duration-300 hover:text-emerald-400 flex items-center gap-1 focus:outline-none cursor-pointer"
            >
              <HelpCircle size={13} /> Need Help?
            </button>
            <div className="w-full border-t border-slate-800/80 my-1" />

            {!isAdminPortal ? (
              <span className="text-slate-500 text-xs mt-1">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors focus:outline-none cursor-pointer"
                >
                  Create Account
                </button>
              </span>
            ) : (
              <span className="text-slate-500 text-xs mt-1">
                Are you Staff?{" "}
                <button
                  type="button"
                  onClick={() => handlePortalSwitch(false)}
                  className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors focus:outline-none cursor-pointer"
                >
                  Staff Portal
                </button>
              </span>
            )}
          </div>
        </div>

        <Suspense fallback={<div className="text-xs text-slate-500">Loading...</div>}>
          {state.showHelpModal && (
            <HelpModal
              onClose={() => setState((prev) => ({ ...prev, showHelpModal: false }))}
            />
          )}
        </Suspense>
      </main>
      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default Login;
