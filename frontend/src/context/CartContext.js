import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import cartService from '../services/cartService';
import { AuthContext } from './AuthContext';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isConsumer } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!user || !isConsumer) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      setCartError(null);
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCartError(err.response?.data?.detail || 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  }, [user, isConsumer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setIsLoading(true);
      setCartError(null);
      const data = await cartService.addToCart(productId, quantity);
      setCart(data);
      return { success: true, data };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to add item to cart';
      setCartError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setIsLoading(true);
      setCartError(null);
      const data = await cartService.updateCartItem(itemId, quantity);
      setCart(data);
      return { success: true, data };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update quantity';
      setCartError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setIsLoading(true);
      setCartError(null);
      const data = await cartService.removeCartItem(itemId);
      setCart(data);
      return { success: true, data };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to remove item';
      setCartError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      const data = await cartService.clearCart();
      setCart(data);
      return { success: true };
    } catch (err) {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const cartItems = cart?.items || [];
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart?.total_amount || 0.0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        cartCount,
        totalAmount,
        isLoading,
        cartError,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
