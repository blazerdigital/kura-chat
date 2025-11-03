import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const SOURCES = [
  { name: "GPT-5 Cloud", endpoint: "/ping_gpt5" },
  { name: "Mistral Local", endpoint: "/ping_llm" },
  { name: "Mythomax Local", endpoint: "/ping_mythomax" },
  { name: "Gateway Oracle", endpoint: "/ping_gateway" },
];

const statusColor = (status) => {
  if (status === "online") return "text-green-400";
  if (status === "standby") return "text-amber-400";
  if (status === "offline") return "text-red-400";
  return "text-slate-400";
};

export default function BrainStatusPanel({ open, token }) {
  const [statuses, setStatuses] = useState({});
  const [lastCheck, setLastCheck] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatuses = async () => {
    setLoading(true);
    const results = {};

    for (const source of SOURCES) {
      try {
        const res = await fetch(source.endpoint, {
          headers: token
            ? {
                Authorization: `Basic ${token}`,
              }
            : undefined,
        });
        if (!res.ok) {
          results[source.name] = "offline";
          continue;
        }
        const data = await res.json();
        results[source.name] = data.status || "offline";
      } catch (err) {
        results[source.name] = "offline";
      }
    }

    setStatuses(results);
    setLastCheck(new Date());
    setLoading(false);
  };

  useEffect(() => {
    if (!open) return;
    fetchStatuses();
    const id = setInterval(fetchStatuses, 120000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <aside className="fixed right-0 top-0 z-40 h-full w-72 overflow-y-auto border-l border-slate-200 bg-white/95 px-4 py-5 text-slate-900 backdrop-blur transition-transform dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-100">
      <h2 className="mb-2 text-lg font-semibold">🧠 Kura Network Status</h2>
      <button
        type="button"
        onClick={fetchStatuses}
        disabled={loading}
        className="mb-4 text-sm font-medium text-blue-400 transition hover:text-blue-300 disabled:opacity-60"
      >
        {loading ? "Refreshing…" : "↻ Refresh Status"}
      </button>

      <div className="mb-5">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Display
        </h3>
        <ThemeToggle />
      </div>

      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Network Nodes
      </h3>

      <ul className="space-y-2">
        {SOURCES.map((source) => {
          const status = statuses[source.name];
          return (
            <li
              key={source.name}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
            >
              <span>{source.name}</span>
              <span className={`font-medium ${statusColor(status)}`}>
                {status ? status : "checking…"}
              </span>
            </li>
          );
        })}
      </ul>

      {lastCheck && (
        <p className="mt-4 text-xs text-slate-500">
          Last check: {lastCheck.toLocaleTimeString()}
        </p>
      )}
    </aside>
  );
}
