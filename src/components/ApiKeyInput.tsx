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
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3.5 text-sm backdrop-blur-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20">
          <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="flex-1 font-medium text-emerald-300">API kulcs beállítva</span>
        <button
          onClick={handleClear}
          className="rounded-xl px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20"
        >
          Módosítás
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-white/80">
        Google Gemini API kulcs
      </label>
      <div className="flex gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="AIza..."
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur-sm transition focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20 focus:outline-none"
        />
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:shadow-fuchsia-500/40 hover:brightness-110 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
        >
          Mentés
        </button>
      </div>
      <p className="text-xs text-white/30">
        A kulcs csak a böngésződben tárolódik, sehova nem kerül elküldésre.
      </p>
    </div>
  );
}
