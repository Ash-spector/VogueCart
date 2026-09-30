import { Routes, Route, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import OrderDetails from '../pages/OrderDetails';
import AdminLayout from '../admin/AdminLayout';
import Dashboard from '../admin/Dashboard';
import Profile from '../pages/Profile';
import Products from '../admin/Products';
import AddProduct from '../admin/AddProduct';
import EditProduct from '../admin/EditProduct';
import AdminOrders from '../admin/Orders';
import Users from '../admin/Users';
import NotFound from '../pages/NotFound';

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
      {/* Store pages: Navbar + Footer */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/404" element={<NotFound />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin pages: own sidebar layout, admin only */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/products/new" element={<AddProduct />} />
          <Route path="/admin/products/edit/:id" element={<EditProduct />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<Users />} />
        </Route>
      </Route>
    </Routes>
  );
}