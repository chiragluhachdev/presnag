import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Customer (public)
import Home from "@/customer/Home";
import Shops from "@/customer/Shops";
import VendorPage from "@/customer/VendorPage";
import Checkout from "@/customer/Checkout";
import OrderConfirmation from "@/customer/OrderConfirmation";
import OrderTracking from "@/customer/OrderTracking";
import Maintenance from "@/customer/Maintenance";
import Partner from "@/customer/Partner";
import { About, Terms, Privacy } from "@/customer/StaticPages";

// Vendor
import VendorLogin from "@/vendor/VendorLogin";
import VendorRegister from "@/vendor/VendorRegister";
import VendorLayout from "@/vendor/VendorLayout";
import VendorDashboard from "@/vendor/Dashboard";
import VendorOrders from "@/vendor/Orders";
import VendorPayments from "@/vendor/Payments";
import VendorMenu from "@/vendor/Menu";
import VendorSettings from "@/vendor/Settings";
import VendorQR from "@/vendor/QR";
import VendorCoupons from "@/vendor/Coupons";
import VendorReports from "@/vendor/Reports";

// Admin
import AdminLogin from "@/admin/AdminLogin";
import AdminLayout from "@/admin/AdminLayout";
import AdminOverview from "@/admin/Overview";
import AdminVendors from "@/admin/Vendors";
import AdminOrders from "@/admin/Orders";
import AdminFinance from "@/admin/Finance";
import AdminAnalytics from "@/admin/Analytics";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function App() {
  const location = useLocation();
  // Admin area stays reachable during maintenance so the owner can toggle it off.
  const isAdminArea = location.pathname.startsWith("/admin");

  const { data: settings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => api<{ maintenanceMode: boolean }>("/api/public/settings"),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  if (settings?.maintenanceMode && !isAdminArea) {
    return <Maintenance />;
  }

  return (
    <Routes>
      {/* ---------------- Customer (public) ---------------- */}
      <Route path="/" element={<Home />} />
      <Route path="/shops" element={<Shops />} />
      <Route path="/track/:orderNumber" element={<OrderTracking />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
      <Route path="/partner" element={<Partner />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* ---------------- Vendor ----------------
          Static /vendor/* routes outrank the dynamic /vendor/:slug store page. */}
      <Route path="/vendor/login" element={<VendorLogin />} />
      <Route path="/vendor/register" element={<VendorRegister />} />
      <Route
        path="/vendor"
        element={
          <ProtectedRoute roles={["VENDOR"]} redirect="/vendor/login">
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/vendor/dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="payments" element={<VendorPayments />} />
        <Route path="menu" element={<VendorMenu />} />
        <Route path="settings" element={<VendorSettings />} />
        <Route path="qr" element={<VendorQR />} />
        <Route path="coupons" element={<VendorCoupons />} />
        <Route path="reports" element={<VendorReports />} />
      </Route>
      {/* Public vendor store page (dynamic slug) */}
      <Route path="/vendor/:slug" element={<VendorPage />} />

      {/* ---------------- Admin ---------------- */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]} redirect="/admin/login">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="finance" element={<AdminFinance />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
