import { createContext, useContext, useReducer } from "react";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
};

const API_BASE = "http://127.0.0.1:8000";

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = async (product) => {
    // try to add to server-side cart if product has slug
    if (product && product.slug) {
      try {
        await fetch(`${API_BASE}/cart/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ slug: product.slug, quantity: 1 }),
        });
        // optimistic local update
        dispatch({ type: "ADD_TO_CART", payload: product });
        return;
      } catch (e) {
        console.warn("Server cart add failed, falling back to local cart", e);
      }
    }

    dispatch({ type: "ADD_TO_CART", payload: product });
  };

  const removeFromCart = async (productId, productSlug = null) => {
    if (productSlug) {
      try {
        await fetch(`${API_BASE}/cart/`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ slug: productSlug }),
        });
        dispatch({ type: "REMOVE_FROM_CART", payload: productId });
        return;
      } catch (e) {
        console.warn(
          "Server cart remove failed, falling back to local cart",
          e
        );
      }
    }
    dispatch({ type: "REMOVE_FROM_CART", payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const getTotalItems = () =>
    state.items.reduce((total, item) => total + item.quantity, 0);

  const getTotalPrice = () =>
    state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart: state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
