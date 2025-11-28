import { useCart } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-sky-100 pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</h2>
          <button 
            onClick={() => navigate("/")}
            className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-100 pt-20 pb-12">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-sky-900">Shopping Cart</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <div className="space-y-4">
            {cart.items.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                    <p className="text-sky-600 font-bold">{item.price}K each</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-right min-w-20">
                    <p className="font-bold text-lg">{(item.price * item.quantity)}K</p>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center mb-6">
              <span className="text-2xl font-bold">Total:</span>
              <span className="text-2xl font-bold text-sky-600">{getTotalPrice()}K</span>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate("/")}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Continue Shopping
              </button>
              <button 
                onClick={() => alert("Checkout functionality!")}
                className="flex-1 bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;