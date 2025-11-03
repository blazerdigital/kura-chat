import { useEffect, useState } from "react";

const getInitialTheme = () => {
  const stored = localStorage.getItem("kura_theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("kura_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
