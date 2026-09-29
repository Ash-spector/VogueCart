import { createContext, useContext } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const cartCount = 0;

  // Placeholder: replaced by the real API-backed cart in Step 9
  const addToCart = async () => {
    toast('Cart will be enabled in the next step');
    return false;
  };

  return <CartContext.Provider value={{ cartCount, addToCart }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);