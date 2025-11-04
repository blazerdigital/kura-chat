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
    <main className="flex flex-1 flex-col justify-end bg-gray-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="overflow-y-auto px-3 pb-4 pt-16 md:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <div
            ref={scrollRef}
            className="max-h-[60vh] overflow-y-auto space-y-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-inner dark:border-slate-800 dark:bg-slate-900/80"
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
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm text-slate-500">
                  "Ask Kura anything — the dialogue becomes the archive."
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900 md:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-1 flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-2">
                <label
                  htmlFor="modelSelect"
                  className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
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
            </div>

            <div>{statusBadge}</div>
          </div>

          <ChatInput onSend={onSend} disabled={sending} />
        </div>
      </footer>
    </main>
  );
}
