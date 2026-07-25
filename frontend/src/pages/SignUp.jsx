import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { showToast, toastConfig } from "../utils/toastConfig";
import api from "../services/api";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/signup", {
        username,
        email,
        password,
        role
      });

      showToast.success(response.data?.message || "Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);
      const serverMsg = error.response?.data?.message;
      showToast.error(serverMsg || "Failed to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen text-gray-100 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <main className="flex flex-col items-center justify-center w-full max-w-6xl p-6 mx-auto">
        <div className="relative z-10 w-full max-w-md p-10 transition-all duration-300 bg-black rounded-lg shadow-xl opacity-90 backdrop-blur-sm hover:shadow-2xl">
          <h1 className="mb-6 text-3xl font-bold text-center text-white">Create Account</h1>

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Username Input */}
            <div className="relative mb-4">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-white transition-all duration-300 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <label className={`absolute left-5 top-4 text-gray-400 transition-all duration-300 pointer-events-none ${formData.username ? "text-xs -translate-y-3" : ""}`}>
                Username
              </label>
            </div>

            {/* Email Input */}
            <div className="relative mb-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-white transition-all duration-300 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <label className={`absolute left-5 top-4 text-gray-400 transition-all duration-300 pointer-events-none ${formData.email ? "text-xs -translate-y-3" : ""}`}>
                Email Address
              </label>
            </div>

            {/* Password Input */}
            <div className="relative mb-4">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-white transition-all duration-300 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <label className={`absolute left-5 top-4 text-gray-400 transition-all duration-300 pointer-events-none ${formData.password ? "text-xs -translate-y-3" : ""}`}>
                Password
              </label>
            </div>

            {/* Confirm Password Input */}
            <div className="relative mb-4">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 text-white transition-all duration-300 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <label className={`absolute left-5 top-4 text-gray-400 transition-all duration-300 pointer-events-none ${formData.confirmPassword ? "text-xs -translate-y-3" : ""}`}>
                Confirm Password
              </label>
            </div>

            {/* Role Select Dropdown */}
            <div className="relative mb-4">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-5 py-4 text-white transition-all duration-300 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 appearance-none cursor-pointer"
              >
                <option value="employee">Employee / Staff</option>
                <option value="admin">Administrator / Admin</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 mt-2 font-semibold text-white bg-red-600 rounded transition-all duration-300 hover:bg-red-700 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? "Registering..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-red-500 font-semibold hover:underline focus:outline-none"
            >
              Sign In
            </button>
          </div>
        </div>
      </main>
      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default SignUp;
