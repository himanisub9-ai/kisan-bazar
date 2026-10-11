import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Guard
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Farmers from './pages/Farmers';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Consumer Pages
import ConsumerDashboard from './pages/consumer/ConsumerDashboard';
import ConsumerOrders from './pages/consumer/ConsumerOrders';
import ConsumerOrderDetails from './pages/consumer/ConsumerOrderDetails';
import ConsumerCart from './pages/consumer/ConsumerCart';
import ConsumerProfile from './pages/consumer/ConsumerProfile';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerProducts from './pages/farmer/FarmerProducts';
import FarmerProductForm from './pages/farmer/FarmerProductForm';
import FarmerOrders from './pages/farmer/FarmerOrders';
import FarmerProfile from './pages/farmer/FarmerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/farmers" element={<Farmers />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Alias for direct /cart URL */}
              <Route path="/cart" element={<Navigate to="/consumer/cart" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Consumer Dashboard Area */}
            <Route
              path="/consumer"
              element={
                <ProtectedRoute allowedRoles={['consumer']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/consumer/dashboard" replace />} />
              <Route path="dashboard" element={<ConsumerDashboard />} />
              <Route path="orders" element={<ConsumerOrders />} />
              <Route path="orders/:id" element={<ConsumerOrderDetails />} />
              <Route path="cart" element={<ConsumerCart />} />
              <Route path="profile" element={<ConsumerProfile />} />
            </Route>

            {/* Farmer Dashboard Area */}
            <Route
              path="/farmer"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/farmer/dashboard" replace />} />
              <Route path="dashboard" element={<FarmerDashboard />} />
              <Route path="products" element={<FarmerProducts />} />
              <Route path="products/new" element={<FarmerProductForm />} />
              <Route path="products/edit/:id" element={<FarmerProductForm />} />
              <Route path="orders" element={<FarmerOrders />} />
              <Route path="profile" element={<FarmerProfile />} />
            </Route>

            {/* Admin Dashboard Area */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
