// frontend/src/pages/SignUp.jsx - Redesigned premium Registration page component
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { showToast, toastConfig } from "../utils/toastConfig";
import api from "../services/api";
import { User, Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Sparkles, AlertCircle, Building } from "lucide-react";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee" // Default role
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, role } = formData;

    if (!username || !email || !password || !confirmPassword) {
      showToast.error("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      showToast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      showToast.error("Password should be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/signup", {
        username,
        email,
        password,
        role
      });

      const successMsg = role === "admin" 
        ? "Admin registration request submitted! Awaiting Super Admin approval."
        : "User registered successfully! Redirecting to login...";

      showToast.success(response.data?.message || successMsg);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      const serverMsg = error.response?.data?.message;
      showToast.error(serverMsg || "Failed to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        .glass-signup-card {
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
        <div className="w-full max-w-md p-8 md:p-10 rounded-2xl glass-signup-card transition-all duration-300 hover:border-slate-700/60">
          
          {/* Header Brand */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 mb-3 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20">
              <Building className="w-6 h-6 text-slate-950 stroke-[2]" />
            </div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Create Account
            </h2>
            <p className="text-xs text-slate-400 mt-1">Join Akshara Sales Management</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            
            {/* 🎛️ Segmented Slide Control for Role Selection */}
            <div className="relative flex p-1 bg-slate-900/80 border border-slate-800/80 rounded-xl">
              {/* Sliding Highlight Indicator */}
              <div
                className={`absolute top-1 bottom-1 w-[48%] bg-gradient-to-r from-emerald-600/80 to-teal-600/80 rounded-lg transition-all duration-300 ease-out ${
                  formData.role === "admin" ? "left-[50.5%]" : "left-1"
                }`}
              />
              
              {/* Employee Tab */}
              <button
                type="button"
                onClick={() => handleRoleSelect("employee")}
                className={`relative z-10 flex-1 py-2 text-xs font-semibold text-center transition-colors duration-200 cursor-pointer ${
                  formData.role === "employee" ? "text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Employee / User
              </button>

              {/* Admin Tab */}
              <button
                type="button"
                onClick={() => handleRoleSelect("admin")}
                className={`relative z-10 flex-1 py-2 text-xs font-semibold text-center transition-colors duration-200 cursor-pointer ${
                  formData.role === "admin" ? "text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Admin
              </button>
            </div>

            {/* Admin Pending Warning Alert Box */}
            {formData.role === "admin" && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-[11px] animate-fadeIn">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Pending Approval Required</p>
                  <p className="text-amber-500/85 mt-0.5">
                    Your admin account status will be set to pending. You can only sign in after a Super Admin approves your registration.
                  </p>
                </div>
              </div>
            )}

            {/* Username Input */}
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500">
                <User size={16} />
              </span>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3 text-xs text-slate-200 transition-all duration-300 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-slate-600 hover:border-slate-700"
              />
            </div>

            {/* Email Input */}
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
                required
                className="w-full pl-11 pr-4 py-3 text-xs text-slate-200 transition-all duration-300 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-slate-600 hover:border-slate-700"
              />
            </div>

            {/* Password Input */}
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
                required
                className="w-full pl-11 pr-11 py-3 text-xs text-slate-200 transition-all duration-300 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-slate-600 hover:border-slate-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-11 py-3 text-xs text-slate-200 transition-all duration-300 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-slate-600 hover:border-slate-700"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 mt-4 font-bold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all duration-300 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] cursor-pointer ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Registering..." : "Sign Up"}
              {!isSubmitting && <ArrowRight size={14} />}
            </button>
          </form>

          {/* Bottom Actions */}
          <div className="mt-8 text-center flex flex-col items-center gap-3">
            <div className="w-full border-t border-slate-800/80 my-1" />

            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-slate-500 text-xs hover:text-slate-300 transition-colors flex items-center justify-center gap-1 focus:outline-none cursor-pointer"
            >
              <ArrowLeft size={13} /> Back to Sign In
            </button>
          </div>
        </div>
      </main>
      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default SignUp;
