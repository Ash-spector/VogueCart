import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { fetchCart, addCartItem, updateCartItem, removeCartItem, clearCartRequest } from '../services/cartService';

const CartContext = createContext(null);

const EMPTY = { items: [], itemCount: 0, subtotal: 0, shipping: 0, total: 0, freeShippingThreshold: 999, shippingFee: 50 };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  // Load the cart when a user logs in, empty it on logout
  useEffect(() => {
    if (!user) {
      setCart(EMPTY);
      return;
    }
    setLoading(true);
    fetchCart()
      .then(setCart)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  // Runs an API call, stores the new cart, shows errors as toasts
  const run = useCallback(async (request, successMessage) => {
    try {
      const updated = await request();
      setCart(updated);
      if (successMessage) toast.success(successMessage);
      return true;
    } catch (err) {
      toast.error(err.userMessage);
      return false;
    }
  }, []);

  const addToCart = useCallback(
    async (data) => {
      if (!user) {
        toast('Please login to add items to your cart');
        navigate('/login', { state: { from: location } });
        return false;
      }
      return run(() => addCartItem(data), 'Added to cart');
    },
    [user, navigate, location, run]
  );

  const updateQuantity = (itemId, quantity) => run(() => updateCartItem(itemId, quantity));
  const removeItem = (itemId) => run(() => removeCartItem(itemId), 'Item removed');
  const clearCart = () => run(() => clearCartRequest());
  const setCartData = setCart; // used by checkout after an order is placed

  return (
    <CartContext.Provider
      value={{ cart, cartCount: cart.itemCount, loading, addToCart, updateQuantity, removeItem, clearCart, setCartData }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);