import { useEffect, useState } from "react";

export default function ModelStatusBadge() {
  const [status, setStatus] = useState("checking");
  const [models, setModels] = useState([]);

  async function fetchStatus() {
    try {
      const res = await fetch("/ping_llm");
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();

      if (data.status === "online") {
        setStatus("online");
        setModels(data.models || []);
      } else {
        setStatus("offline");
        setModels([]);
      }
    } catch {
      setStatus("offline");
      setModels([]);
    }
  }

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  let color = "text-gray-500";
  let label = "Checking…";

  if (status === "online") {
    color = "text-green-500";
    label = "🟢 Mistral Local";
  } else if (status === "offline") {
    color = "text-red-500";
    label = "🔴 Offline";
  }

  return (
    <span
      className={`text-sm ${color}`}
      title={models.length ? models.join(", ") : undefined}
    >
      {label}
    </span>
  );
}
