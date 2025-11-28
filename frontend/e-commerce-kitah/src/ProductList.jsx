import Product from "./Product.jsx";
import { useState, useEffect } from "react";
import Counter from "./Counter.jsx";
import { useSelection } from "./context/SelectionContext.jsx";

const API_BASE = "http://127.0.0.1:8000";
const initialProducts = [];

function ProductList() {
  const [visible, setVisible] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    desc: "",
    price: "",
    image: "",
  });
  const { selectedIds, clearSelected } = useSelection();


  // load products from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/item_list/`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        // normalize to frontend shape
        const normalized = data.map((it, idx) => ({
          id: it.item_id || it.id || idx + 1,
          name: it.item_name || it.title || "",
          desc: it.item_description || it.description || "",
          price: Number(it.price) || 0,
          image: it.item_picture || it.image || "",
          slug: it.slug || null,
        }));
        setProducts([...initialProducts, ...normalized]);
      } catch (e) {
        // on failure, keep products empty (frontend previously used static list)
        console.warn("Could not fetch products from backend:", e);
      }
    })();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-sky-200 p-6 w-full flex flex-col">
        <h2 className="text-center font-bold text-2xl">Our Products</h2>
        <div className="self-end flex flex-row gap-5 mr-7 mt-[2vh]">
          <button onClick={() => setIsAdding(true)} className="add">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>

          <button
            className="remove"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          </button>
        </div>
        <div className="flex flex-row gap-[2vw] flex-wrap mt-[1vh] self-center">
          {isAdding ? (
            <div className="flex flex-col relative w-[14vw] h-[42vh] mb-6">
              <div className="w-[13.5vw] h-[40vh] bg-sky-100 flex flex-col rounded-2xl text-black p-3">
                <input
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Name"
                  className="mb-2 p-2 rounded border"
                />
                <input
                  value={newProduct.desc}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, desc: e.target.value }))
                  }
                  placeholder="Description"
                  className="mb-2 p-2 rounded border"
                />
                <input
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, price: e.target.value }))
                  }
                  placeholder="Price"
                  className="mb-2 p-2 rounded border"
                />
                <input
                  value={newProduct.image}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, image: e.target.value }))
                  }
                  placeholder="Image URL"
                  className="mb-2 p-2 rounded border"
                />
                <div className="flex gap-2 mt-auto">
                  <button
                    className="bg-emerald-500 text-white py-1 px-2 rounded"
                    onClick={async () => {
                      // basic validation
                      if (!newProduct.name) return;
                      try {
                        const payload = {
                          item_name: newProduct.name,
                          item_description: newProduct.desc || "",
                          price: String(newProduct.price || "0"),
                          item_picture: newProduct.image || "",
                        };
                        const res = await fetch(`${API_BASE}/item_list/`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                          credentials: "include",
                        });
                        if (!res.ok) {
                          const err = await res.json().catch(() => ({}));
                          throw new Error(err.error || JSON.stringify(err));
                        }
                        const created = await res.json();
                        const createdNormalized = {
                          id: created.item_id || created.id,
                          name: created.item_name,
                          desc: created.item_description,
                          price: Number(created.price) || 0,
                          image: created.item_picture || "",
                          slug: created.slug || null,
                        };
                        setProducts((prev) => [createdNormalized, ...prev]);
                        setNewProduct({
                          name: "",
                          desc: "",
                          price: "",
                          image: "",
                        });
                        setIsAdding(false);
                      } catch (e) {
                        // fallback: keep local behavior if backend fails
                        const ids = products.map((p) => Number(p.id)).filter((n) => !isNaN(n));
                        const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
                        setProducts((prev) => [
                          {
                            id: nextId,
                            name: newProduct.name,
                            desc: newProduct.desc || "",
                            price: Number(newProduct.price || 0),
                            image: newProduct.image || "",
                          },
                          ...prev,
                        ]);
                        setNewProduct({
                          name: "",
                          desc: "",
                          price: "",
                          image: "",
                        });
                        setIsAdding(false);
                      }
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-300 py-1 px-2 rounded"
                    onClick={() => {
                      setIsAdding(false);
                      setNewProduct({
                        name: "",
                        desc: "",
                        price: "",
                        image: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {products.map((product) => (
            <Product
              key={product.id}
              product={product}
              visible={visible}
              setVisible={setVisible}
            />
          ))}
        </div>
      </div>
      {/* show Counter only when the minus icon (visible) is toggled */}
      {visible ? (
        <Counter
          onRemoveSelected={async () => {
            // Identify items to delete
            const toDelete = products.filter((p) => selectedIds.includes(p.id));
            
            // Optimistic update
            setProducts((prev) =>
              prev.filter((p) => !selectedIds.includes(p.id))
            );
            clearSelected();

            // Send delete requests to backend
            for (const p of toDelete) {
                // Skip dummy or local-only items (if they have non-numeric IDs and aren't in backend)
                // Assuming backend IDs are numbers.
                if (typeof p.id === 'string' && p.id.startsWith('dummy')) continue;
                
                try {
                    await fetch(`${API_BASE}/item/${p.id}/`, {
                        method: "DELETE",
                        credentials: "include",
                    });
                } catch (e) {
                    console.error(`Failed to delete item ${p.id}`, e);
                    // In a real app, we might revert the optimistic update here
                }
            }
          }}
        />
      ) : null}
    </>
  );
}

export default ProductList;
