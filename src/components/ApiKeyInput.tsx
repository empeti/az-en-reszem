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
      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="flex-1">API kulcs beállítva</span>
        <button
          onClick={handleClear}
          className="rounded-lg px-3 py-1 text-xs font-medium text-emerald-600 transition hover:bg-emerald-100"
        >
          Módosítás
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Google Gemini API kulcs
      </label>
      <div className="flex gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="AIza..."
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
        />
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Mentés
        </button>
      </div>
      <p className="text-xs text-gray-400">
        A kulcs csak a böngésződben tárolódik, sehova nem kerül elküldésre rajtad kívül.
      </p>
    </div>
  );
}
