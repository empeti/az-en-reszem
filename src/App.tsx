import { useState, useCallback, useMemo, useEffect } from "react";
import ApiKeyInput from "./components/ApiKeyInput";
import BillUpload from "./components/BillUpload";
import BillItemList from "./components/BillItemList";
import Summary from "./components/Summary";
import PeopleCount from "./components/PeopleCount";
import TipInput from "./components/TipInput";
import { parseBillImage } from "./services/gemini";
import {
  storeShare,
  loadShare,
  getShareCodeFromPath,
  type SharedBill,
} from "./services/share";
import type { BillData, BillItem } from "./types/bill";

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [billData, setBillData] = useState<BillData | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [peopleCount, setPeopleCount] = useState(2);
  const [totalPaid, setTotalPaid] = useState("");
  const [sharedBill, setSharedBill] = useState<SharedBill | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSharedView = sharedBill !== null;

  useEffect(() => {
    const code = getShareCodeFromPath();
    if (!code) return;

    setShareLoading(true);
    loadShare(code)
      .then(setSharedBill)
      .catch(() => setError("A megosztott számla nem található vagy lejárt."))
      .finally(() => setShareLoading(false));
  }, []);

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
      setError(
        err instanceof Error ? err.message : "Ismeretlen hiba történt.",
      );
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

  function handleToggleShared(sourceId: string) {
    setBillData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === sourceId ? { ...item, isShared: !item.isShared } : item,
        ),
      };
    });
    setSelectedIds(new Set());
  }

  function handleReset() {
    setBillData(null);
    setSelectedIds(new Set());
    setError(null);
    setTotalPaid("");
  }

  const ownerDisplayItems = useMemo<BillItem[]>(() => {
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
            sourceId: item.id,
            price: perPerson,
          });
        }
      } else {
        result.push({ ...item, sourceId: item.id });
      }
    }

    const paid = Number(totalPaid) || 0;
    const tip = paid - billData.total;
    if (tip > 0) {
      const perPerson = Math.round(tip / peopleCount);
      for (let i = 0; i < peopleCount; i++) {
        result.push({
          id: `tip-${i}`,
          name: "Borravaló",
          quantity: 1,
          price: perPerson,
          isShared: true,
        });
      }
    }

    return result;
  }, [billData, peopleCount, totalPaid]);

  const sharedDisplayItems = useMemo<BillItem[]>(() => {
    if (!sharedBill) return [];
    const result: BillItem[] = [];
    const seenShared = new Set<string>();
    let id = 0;

    for (const item of sharedBill.items) {
      if (item.isShared) {
        if (seenShared.has(item.name)) continue;
        seenShared.add(item.name);
        result.push({
          ...item,
          id: `s-${id++}`,
          price: Math.round(item.price / sharedBill.peopleCount),
        });
      } else {
        result.push({ ...item, id: `s-${id++}` });
      }
    }

    const tip = sharedBill.totalPaid - sharedBill.total;
    if (tip > 0) {
      result.push({
        id: `s-tip`,
        name: "Borravaló",
        quantity: 1,
        price: Math.round(tip / sharedBill.peopleCount),
        isShared: true,
      });
    }

    return result;
  }, [sharedBill]);

  const displayItems = isSharedView ? sharedDisplayItems : ownerDisplayItems;
  const hasItems = displayItems.length > 0;
  const effectiveTotal = isSharedView
    ? Math.max(sharedBill!.total, sharedBill!.totalPaid)
    : Math.max(billData?.total ?? 0, Number(totalPaid) || 0);

  async function handleShare() {
    if (!billData) return;
    try {
      const url = await storeShare(
        billData.items,
        billData.total,
        peopleCount,
        Number(totalPaid) || 0,
      );
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Nem sikerült a link létrehozása.");
    }
  }

  function handleExitShared() {
    setSharedBill(null);
    setError(null);
    window.history.replaceState(null, "", "/");
  }

  if (shareLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center space-y-3">
          <svg
            className="mx-auto h-8 w-8 animate-spin text-indigo-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-gray-500">Számla betöltése...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-lg px-4 pt-8 pb-32">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Az én részem
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isSharedView
              ? "Jelöld meg a te tételeidet"
              : "Töltsd fel az éttermi számlát, és jelöld meg a te tételeidet"}
          </p>
        </header>

        <div className="space-y-6">
          {isSharedView && (
            <>
              <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <svg
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101"
                  />
                </svg>
                <span className="flex-1">
                  Megosztott számla &middot; {sharedBill!.peopleCount} fő
                </span>
              </div>

              <BillItemList
                items={displayItems}
                selectedIds={selectedIds}
                onToggle={handleToggle}
              />

              <button
                onClick={handleExitShared}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Saját számla feltöltése
              </button>
            </>
          )}

          {!isSharedView && (
            <>
              <ApiKeyInput onApiKeySet={handleApiKeySet} />

              {apiKey && !hasItems && (
                <BillUpload
                  onProcess={handleProcess}
                  isProcessing={isProcessing}
                />
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <p className="font-medium">Hiba történt</p>
                  <p className="mt-1 text-xs break-all">{error}</p>
                </div>
              )}

              {hasItems && (
                <>
                  <PeopleCount value={peopleCount} onChange={setPeopleCount} />
                  <TipInput
                    billTotal={billData!.total}
                    totalPaid={totalPaid}
                    onChange={setTotalPaid}
                  />
                  <BillItemList
                    items={displayItems}
                    selectedIds={selectedIds}
                    onToggle={handleToggle}
                    onToggleShared={handleToggleShared}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      Új számla
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                    >
                      {copied ? "Link másolva!" : "Link megosztása"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {hasItems && (
        <Summary
          items={displayItems}
          selectedIds={selectedIds}
          billTotal={effectiveTotal}
        />
      )}
    </div>
  );
}
