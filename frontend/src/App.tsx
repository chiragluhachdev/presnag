import { Routes, Route, Navigate } from "react-router-dom";

// Customer (public)
import Home from "@/customer/Home";
import Shops from "@/customer/Shops";
import VendorPage from "@/customer/VendorPage";
import Checkout from "@/customer/Checkout";
import OrderConfirmation from "@/customer/OrderConfirmation";
import OrderTracking from "@/customer/OrderTracking";
import { About, Terms, Privacy } from "@/customer/StaticPages";

// Vendor
import VendorLogin from "@/vendor/VendorLogin";
import VendorLayout from "@/vendor/VendorLayout";
import VendorDashboard from "@/vendor/Dashboard";
import VendorOrders from "@/vendor/Orders";
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
import AdminAnalytics from "@/admin/Analytics";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* ---------------- Customer (public) ---------------- */}
      <Route path="/" element={<Home />} />
      <Route path="/shops" element={<Shops />} />
      <Route path="/track/:orderNumber" element={<OrderTracking />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* ---------------- Vendor ----------------
          Static /vendor/* routes outrank the dynamic /vendor/:slug store page. */}
      <Route path="/vendor/login" element={<VendorLogin />} />
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
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
