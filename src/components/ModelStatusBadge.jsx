import { useEffect, useState } from "react";
import { buildApiUrl, apiHeaders } from "../lib/api";

const MODEL_ENDPOINTS = {
  "mistral-local": { endpoint: "/ping_llm", label: "Mistral Local" },
  "gpt-4o-mini": { endpoint: "/ping_gpt5", label: "GPT-4o Cloud" },
  "gpt-5": { endpoint: "/ping_gpt5", label: "GPT-5 Cloud" },
};

const STATUS_STYLES = {
  online: { color: "text-green-500", prefix: "🟢" },
  standby: { color: "text-amber-500", prefix: "🟡" },
  offline: { color: "text-red-500", prefix: "🔴" },
  checking: { color: "text-slate-400", prefix: "" },
};

export default function ModelStatusBadge({ model = "mistral-local", token }) {
  const [status, setStatus] = useState("checking");
  const [models, setModels] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      const info = MODEL_ENDPOINTS[model] ?? MODEL_ENDPOINTS["mistral-local"];
      try {
        const res = await fetch(buildApiUrl(info.endpoint), {
          headers: apiHeaders(token),
        });
        if (!res.ok) {
          throw new Error("Bad response");
        }
        const data = await res.json();
        if (!isMounted) return;
        const newStatus = data.status || "offline";
        setStatus(newStatus);
        setModels(data.models || []);
      } catch (error) {
        if (!isMounted) return;
        setStatus("offline");
        setModels([]);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [model, token]);

  const { color, prefix } = STATUS_STYLES[status] || STATUS_STYLES.checking;
  const descriptor = MODEL_ENDPOINTS[model]?.label ?? "Model";

  let label = "Checking…";
  if (status === "online") {
    label = `${prefix} ${descriptor}`;
  } else if (status === "standby") {
    label = `${prefix} ${descriptor} (Standby)`;
  } else if (status === "offline") {
    label = `${prefix} Offline`;
  }

  return (
    <span
      className={`text-sm ${color}`}
      title={models.length ? models.join(", ") : descriptor}
    >
      {label}
    </span>
  );
}
