import { useState, useCallback, useMemo } from "react";
import ApiKeyInput from "./components/ApiKeyInput";
import BillUpload from "./components/BillUpload";
import BillItemList from "./components/BillItemList";
import Summary from "./components/Summary";
import PeopleCount from "./components/PeopleCount";
import { parseBillImage } from "./services/gemini";
import type { BillData, BillItem } from "./types/bill";

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [billData, setBillData] = useState<BillData | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [peopleCount, setPeopleCount] = useState(2);

  const handleApiKeySet = useCallback((key: string) => {
    setApiKey(key);
  }, []);

  async function handleProcess(base64: string, mimeType: string) {
    if (!apiKey) return;
    setIsProcessing(true);
    setError(null);
    setBillData(null);
    setSelectedIds(new Set());

    try {
      const data = await parseBillImage(apiKey, base64, mimeType);
      setBillData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba történt.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleToggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleReset() {
    setBillData(null);
    setSelectedIds(new Set());
    setError(null);
  }

  const displayItems = useMemo<BillItem[]>(() => {
    if (!billData) return [];
    const result: BillItem[] = [];
    let sharedCounter = 0;
    for (const item of billData.items) {
      if (item.isShared) {
        const perPerson = Math.round(item.price / peopleCount);
        for (let i = 0; i < peopleCount; i++) {
          result.push({
            ...item,
            id: `shared-${sharedCounter++}`,
            price: perPerson,
          });
        }
      } else {
        result.push(item);
      }
    }
    return result;
  }, [billData, peopleCount]);

  const hasItems = displayItems.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-lg px-4 pt-8 pb-32">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Az én részem
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Töltsd fel az éttermi számlát, és jelöld meg a te tételeidet
          </p>
        </header>

        <div className="space-y-6">
          {/* API Key */}
          <ApiKeyInput onApiKeySet={handleApiKeySet} />

          {/* Upload (only when API key is set) */}
          {apiKey && !hasItems && (
            <BillUpload onProcess={handleProcess} isProcessing={isProcessing} />
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-medium">Hiba történt</p>
              <p className="mt-1 text-xs break-all">{error}</p>
            </div>
          )}

          {/* People count + Item list */}
          {hasItems && (
            <>
              <PeopleCount value={peopleCount} onChange={setPeopleCount} />
              <BillItemList
                items={displayItems}
                selectedIds={selectedIds}
                onToggle={handleToggle}
              />
              <button
                onClick={handleReset}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Új számla feltöltése
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sticky summary footer */}
      {hasItems && (
        <Summary
          items={displayItems}
          selectedIds={selectedIds}
          billTotal={billData!.total}
        />
      )}
    </div>
  );
}
