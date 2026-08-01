// frontend/src/App.jsx - Main application component
import React, { lazy, Suspense, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { SkeletonPageFallback } from "./components/common/Skeleton.jsx";

// Import styles directly
import "./styles/App.css";
import "./styles/toast.css";
import "react-toastify/dist/ReactToastify.css";

// Lazy load components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const InventoryManagement = lazy(() => import("./pages/InventoryManagement"));
const SalesManagement = lazy(() => import("./pages/SalesManagement"));
const DailySales = lazy(() => import("./pages/DailySales"));
const EmployeeManagement = lazy(() => import("./pages/EmployeeManagement"));
const Customers = lazy(() => import("./pages/Customers"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const Reports = lazy(() => import("./pages/Reports"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Sidebar = lazy(() => import("./components/layout/Sidebar"));

// Thin spinner used only for sidebar (tiny lazy load)
const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[40px]">
    <div className="w-6 h-6 border-[3px] border-gray-200 rounded-full animate-spin border-t-emerald-500" />
  </div>
);

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const isLoginPage = location.pathname === "/" || location.pathname === "/signup" || location.pathname === "/admin/login";
  const [isReady, setIsReady] = useState(false);
  const [authState, setAuthState] = useState(false);

  // Wait for initial auth check to complete
  useEffect(() => {
    if (!loading) {
      try {
        const auth = isAuthenticated();
        setAuthState(auth);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setAuthState(false);
      } finally {
        setIsReady(true);
      }
    }
  }, [loading, isAuthenticated]);

  // Dynamic Title
  useEffect(() => {
    const pageTitles = {
      "/dashboard": "Dashboard",
      "/inventory": "Inventory Management",
      "/sales": "Sales Management",
      "/employees": "Employee Management",
      "/reports": "Reports",
      "/": "Login",
    };
    document.title =
      pageTitles[location.pathname] || "Akshara Sales Management";
  }, [location.pathname]);

  if (!isReady) {
    return <SkeletonPageFallback />;
  }

  // Handle undefined routes
  const validRoutes = [
    "/",
    "/signup",
    "/admin/login",
    "/dashboard",
    "/daily-sales",
    "/inventory",
    "/sales",
    "/customers",
    "/calendar",
    "/notifications",
    "/settings",
    "/admin/dashboard",
    "/admin/daily-sales",
    "/admin/inventory",
    "/admin/sales",
    "/admin/employees",
    "/admin/customers",
    "/admin/calendar",
    "/admin/notifications",
    "/admin/settings",
    "/admin/reports",
  ];
  if (!validRoutes.includes(location.pathname)) {
    if (authState) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Handle authentication redirects
  if (!authState && !isLoginPage) {
    return <Navigate to={location.pathname.startsWith("/admin") ? "/admin/login" : "/"} replace />;
  }

  if (authState) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    // If on login pages, redirect to dashboards
    if (isLoginPage) {
      return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
    }
    
    // Enforce RBAC route access
    if (user.role === "admin" && !location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    if (user.role !== "admin" && location.pathname.startsWith("/admin")) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50">
      <Suspense fallback={<SkeletonPageFallback />}>
        {isLoginPage ? (
          <div className="h-screen text-gray-900">
            {location.pathname === "/signup" ? <SignUp /> : <Login />}
          </div>
        ) : (
          <ProtectedLayout />
        )}
      </Suspense>
    </div>
  );
};

const ProtectedLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState("w-16");

  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense fallback={<LoadingSpinner />}>
        <Sidebar updateSidebarState={setSidebarWidth} />
      </Suspense>
      <div
        className={`flex-1 overflow-auto transition-all duration-300 p-3 bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 ${
          sidebarWidth === "w-64" ? "ml-64" : "ml-16"
        }`}
      >
        <Suspense fallback={<SkeletonPageFallback />}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/daily-sales" element={<DailySales />} />
            <Route path="/inventory" element={<InventoryManagement />} />
            <Route path="/sales" element={<SalesManagement />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/daily-sales" element={<DailySales />} />
            <Route path="/admin/inventory" element={<InventoryManagement />} />
            <Route path="/admin/sales" element={<SalesManagement />} />
            <Route path="/admin/employees" element={<EmployeeManagement />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/calendar" element={<CalendarPage />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default App;
