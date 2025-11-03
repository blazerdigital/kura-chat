import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ModelStatusBadge from "./ModelStatusBadge";
import ThemeToggle from "./ThemeToggle";

export default function Chat({ token }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("kura-messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [model, setModel] = useState("mistral-local");
  const [useRetrieval, setUseRetrieval] = useState(true);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const capped = messages.slice(-20);
    localStorage.setItem("kura-messages", JSON.stringify(capped));
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const autoResizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = 200;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  };

  useEffect(() => {
    autoResizeInput();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");

    try {
      setMessages((msgs) => [...msgs, { role: "assistant", text: "…" }]);

      const res = await axios.post(
        "http://localhost:8000/ask",
        {
          question: input,
          namespace: "openai_raw",
          k: useRetrieval ? 6 : 0,
          model,
        },
        {
          headers: {
            Authorization: `Basic ${token}`,
          },
        }
      );

      setMessages((msgs) => [
        ...msgs.slice(0, -1),
        { role: "assistant", text: res.data.answer },
      ]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs.slice(0, -1),
        { role: "assistant", text: "⚠️ Error contacting backend." },
      ]);
    }

    setTimeout(autoResizeInput, 0);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-4 md:py-6">
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col space-y-3 md:space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`w-full max-w-[640px] rounded-2xl px-4 py-3 shadow md:px-5 ${
                m.role === "user"
                  ? "rounded-br-none bg-blue-500 text-white"
                  : "rounded-bl-none bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-3 py-2 transition-colors dark:border-slate-800 dark:bg-slate-900 md:px-4 md:py-3">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 md:w-auto"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="mistral-local">Local: Mistral</option>
            <option value="gpt-4o-mini">OpenAI: GPT-4o-mini</option>
            <option value="gpt-5">OpenAI: GPT-5</option>
          </select>

          <label className="flex items-center gap-1 text-slate-700 dark:text-slate-200 md:gap-2">
            <input
              type="checkbox"
              checked={useRetrieval}
              onChange={() => setUseRetrieval(!useRetrieval)}
            />
            Retrieval
          </label>

          <ModelStatusBadge />
          <ThemeToggle />
        </div>

        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            className="flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-3 py-2 leading-relaxed focus:outline-none focus:ring focus:ring-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={input}
            rows={1}
            onChange={(e) => {
              setInput(e.target.value);
              autoResizeInput();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask Oracle..."
          />
          <button
            className="rounded-full bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
