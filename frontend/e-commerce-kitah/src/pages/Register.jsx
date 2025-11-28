import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    try {
      register({ name, email, password });
      navigate("/");
    } catch (err) {
      setError(err.message || "Register failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100 pt-20">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-[24rem]"
      >
        <h2 className="text-2xl font-semibold mb-4">Register</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <label className="block mb-2">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <label className="block mb-2">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <label className="block mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-amber-500 text-white px-4 py-2 rounded"
          >
            Create account
          </button>
        </div>
      </form>
    </div>
  );
}
