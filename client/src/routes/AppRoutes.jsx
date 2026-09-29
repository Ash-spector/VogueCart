import { Routes, Route, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';

// Temporary page for routes we haven't built yet, so no link is ever broken
const ComingSoon = ({ title }) => (
  <div className="page-container py-24 text-center">
    <h1 className="text-2xl font-semibold">{title}</h1>
    <p className="mt-2 text-sm text-neutral-500">This page is coming in the next steps.</p>
    <Link to="/" className="btn-outline mt-6">Back to Home</Link>
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ComingSoon title="Shop" />} />
        <Route path="/product/:id" element={<ComingSoon title="Product Details" />} />
        <Route path="/login" element={<ComingSoon title="Login" />} />
        <Route path="/register" element={<ComingSoon title="Register" />} />
        <Route path="/cart" element={<ComingSoon title="Cart" />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<ComingSoon title="Checkout" />} />
          <Route path="/orders" element={<ComingSoon title="My Orders" />} />
          <Route path="/orders/:id" element={<ComingSoon title="Order Details" />} />
          <Route path="/profile" element={<ComingSoon title="My Profile" />} />
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<ComingSoon title="Admin Dashboard" />} />
          <Route path="/admin/products" element={<ComingSoon title="Product Management" />} />
          <Route path="/admin/products/new" element={<ComingSoon title="Add Product" />} />
          <Route path="/admin/products/edit/:id" element={<ComingSoon title="Edit Product" />} />
          <Route path="/admin/orders" element={<ComingSoon title="Order Management" />} />
          <Route path="/admin/users" element={<ComingSoon title="User Management" />} />
        </Route>

        <Route path="*" element={<ComingSoon title="Page not found" />} />
      </Route>
    </Routes>
  );
}