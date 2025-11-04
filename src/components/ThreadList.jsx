export default function ThreadList({
  threads,
  activeId,
  loading,
  onSelect,
  onCreate,
  onDelete,
  onClose,
  className = "",
}) {
  return (
    <aside
      className={`flex h-full w-72 flex-col border-r border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
          Threads
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCreate}
            className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-600"
          >
            + New Chat
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-500 transition hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loading ? (
          <p className="px-2 text-sm text-slate-500">Loading…</p>
        ) : threads?.length ? (
          <ul className="space-y-1">
            {threads.map((thread) => (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => onSelect(thread)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeId === thread.id
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="truncate pr-2">{thread.title || "Untitled"}</span>
                  <span
                    className="text-xs opacity-80"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(thread);
                    }}
                  >
                    🗑️
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-2 text-sm text-slate-500">No chats yet.</p>
        )}
      </div>
    </aside>
  );
}
