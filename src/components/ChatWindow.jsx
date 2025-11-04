import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

export default function ChatWindow({
  thread,
  messages,
  loading,
  onSend,
  sending,
  model,
  onModelChange,
  useRetrieval,
  onToggleRetrieval,
  statusBadge,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <main className="flex flex-1 flex-col bg-gray-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6">
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold">
                  {thread?.title || "Kura Chat"}
                </h1>
                {thread?.created_at ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Created {new Date(thread.created_at).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select a conversation or create a new one.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-2">
                  <label htmlFor="modelSelect" className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Model
                  </label>
                  <select
                    id="modelSelect"
                    value={model}
                    onChange={(e) => onModelChange?.(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="mistral-local">Local: Mistral</option>
                    <option value="gpt-4o-mini">OpenAI: GPT-4o-mini</option>
                    <option value="gpt-5">OpenAI: GPT-5</option>
                    <option value="mythomax-local">Local: Mythomax</option>
                  </select>
                </span>

                <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={useRetrieval}
                    onChange={() => onToggleRetrieval?.(!useRetrieval)}
                    className="accent-blue-500"
                  />
                  Retrieval
                </label>

                {statusBadge}
              </div>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-inner dark:border-slate-800 dark:bg-slate-900/80"
          >
            {loading ? (
              <p className="text-sm text-slate-500">Loading messages…</p>
            ) : messages?.length ? (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id || msg.created_at || Math.random()}
                  message={msg}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500">
                {thread
                  ? "No messages yet — send the first prompt."
                  : "Choose a conversation or create a new one."}
              </p>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900 md:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <ChatInput onSend={onSend} disabled={sending || !thread} />
        </div>
      </footer>
    </main>
  );
}
