import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

// Public pages
import HomePage from './pages/public/HomePage.jsx';
import ProductsPage from './pages/public/ProductsPage.jsx';
import ProductDetailPage from './pages/public/ProductDetailPage.jsx';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';

// Route guard
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public ───────────────────────────────── */}
          <Route path="/"                 element={<HomePage />} />
          <Route path="/collection"       element={<ProductsPage />} />
          <Route path="/collection/:id"   element={<ProductDetailPage />} />

          {/* ── Admin Auth ───────────────────────────── */}
          <Route path="/admin/login"      element={<AdminLoginPage />} />

          {/* ── Admin Protected ──────────────────────── */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route index                        element={<AdminDashboardPage />} />
            <Route path="products"              element={<AdminProductsPage />} />
            <Route path="categories"            element={<AdminCategoriesPage />} />
            <Route path="settings"              element={<AdminSettingsPage />} />
          </Route>

          {/* ── Fallback ─────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
