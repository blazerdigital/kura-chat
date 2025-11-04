import { useCallback, useEffect, useMemo, useState } from "react";
import ThreadList from "./ThreadList";
import ChatWindow from "./ChatWindow";
import ModelStatusBadge from "./ModelStatusBadge";
import {
  getThreads,
  createThread,
  getMessages,
  sendMessage,
  deleteThread,
} from "../api/kura";

export default function Chat({ token }) {
  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [error, setError] = useState(null);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) || null,
    [threads, activeThreadId]
  );

  const refreshThreads = useCallback(
    async (opts = {}) => {
      if (!token) return;
      setThreadsLoading(true);
      try {
        const data = await getThreads(token);
        const list = Array.isArray(data?.threads) ? data.threads : Array.isArray(data) ? data : [];
        setThreads(list);
        if (opts.selectFirst && list.length) {
          setActiveThreadId(list[0].id);
        } else if (opts.selectNew && opts.selectNew.id) {
          setActiveThreadId(opts.selectNew.id);
        } else if (activeThreadId && !list.some((t) => t.id === activeThreadId)) {
          setActiveThreadId(list[0]?.id || null);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load threads");
      } finally {
        setThreadsLoading(false);
      }
    },
    [token, activeThreadId]
  );

  const loadMessages = useCallback(
    async (threadId) => {
      if (!threadId || !token) return;
      setMessagesLoading(true);
      try {
        const data = await getMessages(threadId, token);
        const msgs = Array.isArray(data?.messages) ? data.messages : Array.isArray(data) ? data : [];
        setMessages(msgs);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load messages");
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    refreshThreads({ selectFirst: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (activeThreadId) {
      loadMessages(activeThreadId);
    } else {
      setMessages([]);
    }
  }, [activeThreadId, loadMessages]);

  const handleCreateThread = async () => {
    try {
      const data = await createThread("New Chat", token);
      const newThread = data?.thread || data;
      if (!newThread?.id) {
        throw new Error("Thread response missing id");
      }
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
      setMessages([]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create thread");
    }
  };

  const handleSelectThread = (thread) => {
    setActiveThreadId(thread.id);
  };

  const handleDeleteThread = async (thread) => {
    if (!window.confirm("Delete this chat?")) return;
    try {
      await deleteThread(thread.id, token);
      setThreads((prev) => prev.filter((t) => t.id !== thread.id));
      if (activeThreadId === thread.id) {
        setActiveThreadId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete thread");
    }
  };

  const handleSendMessage = async (text) => {
    if (!activeThreadId) {
      await handleCreateThread();
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);
    setError(null);

    try {
      const response = await sendMessage(activeThreadId, text, token);
      if (response?.messages && Array.isArray(response.messages)) {
        setMessages(response.messages);
      } else {
        const assistantText = response?.answer || response?.message || "";
        if (assistantText) {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: assistantText,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }

      if (response?.thread) {
        setThreads((prev) => {
          const filtered = prev.filter((t) => t.id !== response.thread.id);
          return [response.thread, ...filtered];
        });
        setActiveThreadId(response.thread.id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send message");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <ThreadList
        threads={threads}
        activeId={activeThreadId}
        loading={threadsLoading}
        onSelect={handleSelectThread}
        onCreate={handleCreateThread}
        onDelete={handleDeleteThread}
      />

      <div className="relative flex flex-1 flex-col">
        <div className="absolute right-6 top-6 hidden text-sm text-slate-500 md:block">
          <ModelStatusBadge model={activeThread?.model || threads?.[0]?.model || "mistral-local"} token={token} />
        </div>

        {error && (
          <div className="absolute left-1/2 top-4 z-10 w-[80%] max-w-xl -translate-x-1/2 rounded border border-red-300 bg-red-100 px-4 py-2 text-sm text-red-800 shadow dark:border-red-700 dark:bg-red-900 dark:text-red-100">
            {error}
          </div>
        )}

        <ChatWindow
          thread={activeThread}
          messages={messages}
          loading={messagesLoading}
          onSend={handleSendMessage}
          sending={sending}
        />
      </div>
    </div>
  );
}
