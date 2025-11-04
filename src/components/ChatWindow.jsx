import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

export default function ChatWindow({
  thread,
  messages,
  loading,
  onSend,
  sending,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <main className="flex flex-1 flex-col bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {thread?.title || "Select a chat"}
        </h1>
        {thread?.created_at && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Created {new Date(thread.created_at).toLocaleString()}
          </p>
        )}
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
      >
        {loading ? (
          <p className="text-sm text-slate-500">Loading messages…</p>
        ) : messages?.length ? (
          messages.map((msg) => <MessageBubble key={msg.id || msg.created_at || Math.random()} message={msg} />)
        ) : (
          <p className="text-sm text-slate-500">
            {thread ? "No messages yet — send the first prompt." : "Choose a conversation or create a new one."}
          </p>
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <ChatInput onSend={onSend} disabled={sending || !thread} />
      </footer>
    </main>
  );
}
