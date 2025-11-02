import { useState } from "react";
import AuthGate from "./components/AuthGate";
import Chat from "./components/Chat";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("kura_auth") || null);

  if (!token) {
    return <AuthGate onAuth={setToken} />;
  }

  return <Chat token={token} />;
}
