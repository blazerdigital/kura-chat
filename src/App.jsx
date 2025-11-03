import { useState } from "react";
import AuthGate from "./components/AuthGate";
import Chat from "./components/Chat";
import BrainStatusPanel from "./components/BrainStatusPanel";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("kura_auth") || null);
  const [panelOpen, setPanelOpen] = useState(false);

  if (!token) {
    return <AuthGate onAuth={setToken} />;
  }

  return (
    <div className="relative min-h-screen">
      <button
        type="button"
        onClick={() => setPanelOpen((prev) => !prev)}
        className="fixed right-4 top-4 z-50 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
      >
        {panelOpen ? "Close Brain Panel" : "🧠 Brain Status"}
      </button>

      <BrainStatusPanel open={panelOpen} token={token} />

      <Chat token={token} />
    </div>
  );
}
