import "./index.css";
import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { useCart } from "./context/CartContext.jsx";

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const total = getTotalItems();

  return (
    <header className="bg-sky-950 flex flex-row fixed w-full items-center z-30 h-16">
      <Link to="/" className="p-4 flex flex-row gap-2 hover:opacity-80">
        <img src="/src/assets/react.svg" alt="Tokopetei" className="w-8" />
        <h1 className="text-amber-50 font-semibold text-2xl">Tokopetei</h1>
      </Link>

      <div className="text-white ml-[10vw] mr-[2vw]">
        <input
          type="text"
          placeholder="Search"
          className="py-1.5 px-2.5 w-[40vw] rounded-lg bg-sky-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      <nav className="text-amber-50 flex flex-row gap-8 m-2 text-lg">
        <Link to="/" className="hover:text-amber-200">
          Home
        </Link>
        <Link to="/" className="hover:text-amber-200">
          Products
        </Link>
        <Link to="/cart" className="relative hover:text-amber-200">
          {total > 0 && (
            <span className="absolute -top-2 -left-3 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {total}
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </Link>
      </nav>

      <div className="text-white flex flex-row gap-6 ml-auto mr-12 text-lg items-center">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="hover:text-amber-200">
              Login
            </Link>
            <Link to="/register" className="hover:text-amber-200">
              Register
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-amber-200">{user?.name}</span>
            <button
              onClick={logout}
              className="bg-amber-500 text-black px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
