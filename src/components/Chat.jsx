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
  const [threadsOpen, setThreadsOpen] = useState(false);
  const [model, setModel] = useState("mistral-local");
  const [useRetrieval, setUseRetrieval] = useState(true);

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

        if (!list.length) {
          const created = await createThread("New Chat", token);
          const newThread = created?.thread || created;
          if (newThread?.id) {
            setThreads([newThread]);
            setActiveThreadId(newThread.id);
          } else {
            setThreads([]);
            setActiveThreadId(null);
          }
          return;
        }

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
      setThreadsOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create thread");
    }
  };

  const handleSelectThread = (thread) => {
    setActiveThreadId(thread.id);
    setThreadsOpen(false);
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
    let threadId = activeThreadId;
    if (!threadId) {
      try {
        const created = await createThread("New Chat", token);
        const newThread = created?.thread || created;
        if (newThread?.id) {
          setThreads((prev) => [newThread, ...prev]);
          setActiveThreadId(newThread.id);
          setMessages([]);
          threadId = newThread.id;
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to create thread");
        return;
      }
    }

    if (!threadId) return;

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
      const response = await sendMessage(threadId, text, token, {
        model,
        k: useRetrieval ? 6 : 0,
      });
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
      <div className="hidden h-full lg:flex">
        <ThreadList
          threads={threads}
          activeId={activeThreadId}
          loading={threadsLoading}
          onSelect={handleSelectThread}
          onCreate={handleCreateThread}
          onDelete={handleDeleteThread}
        />
      </div>

      <div className="relative flex flex-1 flex-col">
        <button
          type="button"
          onClick={() => setThreadsOpen(true)}
          className="fixed left-4 top-4 z-40 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 lg:hidden"
        >
          ☰ Threads
        </button>

        {threadsOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setThreadsOpen(false)}
            />
            <ThreadList
              threads={threads}
              activeId={activeThreadId}
              loading={threadsLoading}
              onSelect={handleSelectThread}
              onCreate={handleCreateThread}
              onDelete={handleDeleteThread}
              onClose={() => setThreadsOpen(false)}
              className="relative z-50 h-full"
            />
          </div>
        )}

        {error && threads.length > 0 && (
          <div className="absolute left-1/2 top-4 z-30 w-[90%] max-w-xl -translate-x-1/2 rounded border border-red-300 bg-red-100 px-4 py-2 text-sm text-red-800 shadow dark:border-red-700 dark:bg-red-900 dark:text-red-100">
            {error}
          </div>
        )}

        <ChatWindow
          thread={activeThread}
          messages={messages}
          loading={messagesLoading}
          onSend={handleSendMessage}
          sending={sending}
          model={model}
          onModelChange={setModel}
          useRetrieval={useRetrieval}
          onToggleRetrieval={(next) => setUseRetrieval(Boolean(next))}
          statusBadge={
            <ModelStatusBadge
              model={model}
              token={token}
            />
          }
        />
      </div>
    </div>
  );
}
