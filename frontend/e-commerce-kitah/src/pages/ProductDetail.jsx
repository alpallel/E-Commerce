import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const API_BASE = "http://127.0.0.1:8000";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(state?.product || null);
  const [loading, setLoading] = useState(!state?.product);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/item/${id}/`);
        if (!res.ok) {
            // If we have local product data (e.g. dummy or local add), ignore 404
            if (state?.product) return;
            throw new Error("Product not found");
        }
        const data = await res.json();
        setProduct({
          id: data.item_id || data.id,
          name: data.item_name,
          desc: data.item_description,
          price: Number(data.price),
          image: data.item_picture,
          slug: data.slug,
        });
      } catch (err) {
        if (!state?.product) {
            setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, state]);

  if (loading) return <div className="min-h-screen pt-20 text-center">Loading...</div>;
  if (error) return <div className="min-h-screen pt-20 text-center text-red-600">{error}</div>;
  if (!product) return null;

  return (
    <div className="min-h-screen bg-sky-100 pt-24 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 h-96 md:h-auto bg-gray-200">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        <div className="md:w-1/2 p-8 flex flex-col">
          <button
            onClick={() => navigate(-1)}
            className="self-start text-sky-600 mb-4 hover:underline"
          >
            &larr; Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          <p className="text-2xl text-sky-600 font-bold mb-6">{product.price}K</p>
          <p className="text-gray-600 mb-8 leading-relaxed">{product.desc}</p>
          
          <div className="mt-auto">
            <button
              onClick={() => {
                addToCart(product);
                alert("Added to cart!");
              }}
              className="w-full bg-sky-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-sky-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
