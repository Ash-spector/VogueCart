import { createContext, useContext } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const cartCount = 0; // real cart logic arrives in Step 9
  return <CartContext.Provider value={{ cartCount }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);