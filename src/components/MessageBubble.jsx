import dayjs from "dayjs";

export default function MessageBubble({ message }) {
  if (!message) return null;

  const role = message.role || message.author || "assistant";
  const text = message.content || message.text || message.message || "";
  const createdAt = message.created_at || message.timestamp;
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] rounded-lg px-4 py-2 text-sm shadow transition ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
        {createdAt && (
          <p className="mt-1 text-[0.7rem] opacity-70">
            {dayjs(createdAt).format("MMM D, HH:mm")}
          </p>
        )}
      </div>
    </div>
  );
}
