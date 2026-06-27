import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Spinner from './components/ui/Spinner.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';

// ── Code-split all pages with React.lazy ──────────────────
// Public pages
const HomePage         = lazy(() => import('./pages/public/HomePage.jsx'));
const ProductsPage     = lazy(() => import('./pages/public/ProductsPage.jsx'));
const ProductDetailPage = lazy(() => import('./pages/public/ProductDetailPage.jsx'));

// Admin pages (larger bundle – only loaded for admins)
const AdminLoginPage      = lazy(() => import('./pages/admin/AdminLoginPage.jsx'));
const AdminDashboardPage  = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
const AdminProductsPage   = lazy(() => import('./pages/admin/AdminProductsPage.jsx'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage.jsx'));
const AdminSettingsPage   = lazy(() => import('./pages/admin/AdminSettingsPage.jsx'));

// Route guard
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

// Full-page loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public ───────────────────────────────── */}
              <Route path="/"               element={<HomePage />} />
              <Route path="/collection"     element={<ProductsPage />} />
              <Route path="/collection/:id" element={<ProductDetailPage />} />

              {/* ── Admin Auth ───────────────────────────── */}
              <Route path="/admin/login"    element={<AdminLoginPage />} />

              {/* ── Admin Protected ──────────────────────── */}
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route index                  element={<AdminDashboardPage />} />
                <Route path="products"        element={<AdminProductsPage />} />
                <Route path="categories"      element={<AdminCategoriesPage />} />
                <Route path="settings"        element={<AdminSettingsPage />} />
              </Route>

              {/* ── Fallback ─────────────────────────────── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
