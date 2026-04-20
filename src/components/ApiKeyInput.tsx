import { useState, useEffect } from "react";

const STORAGE_KEY = "gemini-api-key";

interface Props {
  onApiKeySet: (key: string) => void;
}

export default function ApiKeyInput({ onApiKeySet }: Props) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setKey(stored);
      setSaved(true);
      onApiKeySet(stored);
    }
  }, [onApiKeySet]);

  function handleSave() {
    const trimmed = key.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    setSaved(true);
    onApiKeySet(trimmed);
  }

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY);
    setKey("");
    setSaved(false);
    onApiKeySet("");
  }

  if (saved) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm dark:border-emerald-700 dark:bg-emerald-900/20">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-800/40">
          <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="flex-1 font-medium text-emerald-700 dark:text-emerald-300">API kulcs beállítva</span>
        <button
          onClick={handleClear}
          className="rounded-xl px-3 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-800/40"
        >
          Módosítás
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200">
        Google Gemini API kulcs
      </label>
      <div className="flex gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="AIza..."
          className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm placeholder-gray-300 transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-900"
        />
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-teal-500/20 transition hover:shadow-lg hover:brightness-105 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
        >
          Mentés
        </button>
      </div>
      <p className="text-xs text-gray-400 dark:text-slate-500">
        A kulcs csak a böngésződben tárolódik, sehova nem kerül elküldésre.
      </p>
    </div>
  );
}
