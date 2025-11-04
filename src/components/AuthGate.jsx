import { useState } from "react";
import { buildApiUrl } from "../lib/api";

export default function AuthGate({ onAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const token = btoa(`${username}:${password}`);
    try {
      const res = await fetch(buildApiUrl("/health"), {
        headers: { Authorization: `Basic ${token}` },
      });
      if (res.ok) {
        localStorage.setItem("kura_auth", token);
        onAuth(token);
      } else {
        setError("Invalid credentials.");
      }
    } catch {
      setError("Cannot reach Kura API.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-2xl mb-6">🔒 Kura Access</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-64">
        <input
          className="p-2 rounded bg-gray-800 border border-gray-700"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="p-2 rounded bg-gray-800 border border-gray-700"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="p-2 bg-blue-600 rounded hover:bg-blue-500 transition"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
