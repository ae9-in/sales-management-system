// frontend/src/pages/Login.jsx - Authentication page component for user login
import React, { useState, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { showToast, toastConfig } from "../utils/toastConfig";
import { useAuth } from "../hooks/useAuth";

// Lazy load non-critical resources
const HelpModal = lazy(() => import("../components/feedback/HelpModal"));

// Import styles only when needed
const loadToastStyles = () => import("react-toastify/dist/ReactToastify.css");


const DEVELOPERS = [
  { name: "sai varshith", email: "saivarshithmaddala@gmail.com" },
];

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [state, setState] = useState({ showHelpModal: false, isSubmitting: false });

  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();

  const isAdminMode = location.pathname === "/admin/login";

  // Load non-critical resources after component mounts
  React.useEffect(() => {
    loadToastStyles();

  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      showToast.error("Please enter both email and password");
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const result = await login(formData);

      if (result.success) {
        const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
        
        if (isAdminMode) {
          if (loggedInUser.role === "admin") {
            showToast.success("Admin login successful! Redirecting...");
            setTimeout(() => navigate("/admin/dashboard"), 1000);
          } else {
            logout();
            showToast.error("Unauthorized. Employees must log in via the main login page.");
            setFormData(prev => ({ ...prev, password: "" }));
          }
        } else {
          if (loggedInUser.role !== "admin") {
            showToast.success("Login successful! Redirecting...");
            setTimeout(() => navigate("/dashboard"), 1000);
          } else {
            logout();
            showToast.error("Admins must log in via the Admin Login page.");
            setFormData(prev => ({ ...prev, password: "" }));
          }
        }
      } else {
        showToast.error(result.message || "Invalid email or password");
        setFormData(prev => ({ ...prev, password: "" }));
      }
    } catch (error) {
      showToast.error("An error occurred. Please try again.");
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      if (field === 'email') {
        e.preventDefault();
        document.querySelector('input[name="password"]').focus();
      } else if (field === 'password') {
        e.preventDefault();
        handleLogin();
      }
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen text-gray-900 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <main className="flex flex-col items-center justify-center w-full max-w-6xl p-6 mx-auto">


        <div className="relative z-10 w-full max-w-md p-12 transition-all duration-300 bg-black rounded-lg shadow-xl opacity-90 backdrop-blur-sm hover:shadow-2xl">
          <h1 className="mb-8 text-3xl font-bold text-center text-gray-900">
            {isAdminMode ? "Admin Portal" : "Welcome Back!"}
          </h1>

          <div className="space-y-4">
            {["email", "password"].map((field) => (
              <div key={field} className="relative mb-4">
                <input
                  type={field === "password" ? "password" : "email"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyPress(e, field)}
                  autoComplete={field === "email" ? "email" : "current-password"}
                  required
                  className="w-full px-5 py-4 text-gray-900 transition-all duration-300 bg-white rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <label className={`absolute left-5 top-4 text-gray-500 transition-all duration-300 pointer-events-none ${formData[field] ? "text-xs -translate-y-3" : ""}`}>
                  {field === "email" ? "Email Address" : "Password"}
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={handleLogin}
              disabled={state.isSubmitting}
              className={`w-full px-4 py-3 mt-2 font-semibold text-gray-900 bg-red-600 rounded transition-all duration-300 hover:bg-red-700 ${state.isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {state.isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="mt-3.5 text-center flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setState(prev => ({ ...prev, showHelpModal: true }))}
              className="text-gray-900 text-xs transition-colors duration-300 hover:text-red-400 hover:underline focus:outline-none"
            >
              Need Help?
            </button>
            {isAdminMode ? (
              <span className="text-gray-500 text-[11px] mt-1">
                Are you an Employee?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-red-500 font-semibold hover:underline focus:outline-none"
                >
                  Employee Portal
                </button>
              </span>
            ) : (
              <span className="text-gray-500 text-[11px] mt-1">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-red-500 font-semibold hover:underline focus:outline-none"
                >
                  Sign Up
                </button>
              </span>
            )}
          </div>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          {state.showHelpModal && (
            <HelpModal
              onClose={() => setState(prev => ({ ...prev, showHelpModal: false }))}
            />
          )}
        </Suspense>
      </main>
      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default Login;



