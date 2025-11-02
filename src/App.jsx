import { useState, useRef, useEffect } from "react";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState(() => {
  // load from localStorage at startup
  const saved = localStorage.getItem("kura-messages");
  return saved ? JSON.parse(saved) : [];
});
  useEffect(() => {
  // cap at 20 messages
  const capped = messages.slice(-20);
  localStorage.setItem("kura-messages", JSON.stringify(capped));
}, [messages]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("mistral-local"); // dropdown
  const [useRetrieval, setUseRetrieval] = useState(true); // toggle
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");

    try {
      // temporary placeholder
      setMessages((msgs) => [...msgs, { role: "assistant", text: "…" }]);

      const res = await axios.post("http://localhost:8000/ask", {
        question: input,
        namespace: "openai_raw",
        k: useRetrieval ? 6 : 0, // turn retrieval on/off
        model,
      });

      setMessages((msgs) => [
        ...msgs.slice(0, -1),
        { role: "assistant", text: res.data.answer },
      ]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", text: "⚠️ Error contacting backend." },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl shadow ${
                m.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Controls */}
      <div className="border-t p-3 flex flex-col gap-2 bg-white">
        <div className="flex items-center gap-4">
          {/* Dropdown */}
          <select
            className="border px-3 py-2 rounded-md"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="mistral-local">Local: Mistral</option>
            <option value="gpt-4o-mini">OpenAI: GPT-4o-mini</option>
            <option value="gpt-5">OpenAI: GPT-5</option>
          </select>

          {/* Retrieval toggle */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useRetrieval}
              onChange={() => setUseRetrieval(!useRetrieval)}
            />
            Retrieval
          </label>
        </div>

        {/* Input bar */}
        <div className="flex gap-2">
          <input
            className="flex-1 border px-3 py-2 rounded-full focus:outline-none focus:ring focus:ring-blue-300"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask Oracle..."
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-full"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
