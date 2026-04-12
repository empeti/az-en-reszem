import { useState, useCallback, useMemo, useEffect } from "react";
import ApiKeyInput from "./components/ApiKeyInput";
import BillUpload from "./components/BillUpload";
import BillItemList from "./components/BillItemList";
import Summary from "./components/Summary";
import PeopleCount from "./components/PeopleCount";
import TipInput from "./components/TipInput";
import { parseBillImage } from "./services/gemini";
import {
  createShareLink,
  loadSharedBill,
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
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const isSharedView = sharedBill !== null;

  useEffect(() => {
    const code = getShareCodeFromPath();
    if (!code) return;

    setShareLoading(true);
    loadSharedBill(code)
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
    setShareUrl(null);
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
    setSharing(true);
    setError(null);
    try {
      const url = await createShareLink(
        billData.items,
        billData.total,
        peopleCount,
        Number(totalPaid) || 0,
      );
      setShareUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch {
        /* clipboard may fail on HTTP */
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nem sikerült a link létrehozása.",
      );
    } finally {
      setSharing(false);
    }
  }

  function handleExitShared() {
    setSharedBill(null);
    setError(null);
    window.history.replaceState(null, "", "/");
  }

  if (shareLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
        <div className="text-center space-y-4">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-fuchsia-400" />
          </div>
          <p className="text-sm font-medium text-white/60">Számla betöltése...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
      {/* Decorative background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-purple-500/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-10 pb-36">
        {/* Header */}
        <header className="mb-10 text-center animate-fade-in-up">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/25">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Az én részem
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {isSharedView
              ? "Jelöld meg a te tételeidet"
              : "Töltsd fel az éttermi számlát, és válaszd ki a tételeidet"}
          </p>
        </header>

        <div className="space-y-4">
          {isSharedView && (
            <>
              <div className="animate-fade-in-up flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white/70 backdrop-blur-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-fuchsia-500/20">
                  <svg className="h-4 w-4 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                  </svg>
                </div>
                <span className="flex-1 font-medium">
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
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/60 backdrop-blur-sm transition hover:bg-white/10 hover:text-white/80"
              >
                Saját számla feltöltése
              </button>
            </>
          )}

          {!isSharedView && (
            <>
              <div className="animate-fade-in-up">
                <ApiKeyInput onApiKeySet={handleApiKeySet} />
              </div>

              {apiKey && !hasItems && (
                <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  <BillUpload
                    onProcess={handleProcess}
                    isProcessing={isProcessing}
                  />
                </div>
              )}

              {error && (
                <div className="animate-fade-in-up rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-sm backdrop-blur-sm">
                  <p className="font-semibold text-red-300">Hiba történt</p>
                  <p className="mt-1 text-xs text-red-300/70 break-all">{error}</p>
                </div>
              )}

              {hasItems && (
                <>
                  <div className="animate-fade-in-up space-y-4">
                    <PeopleCount value={peopleCount} onChange={setPeopleCount} />
                    <TipInput
                      billTotal={billData!.total}
                      totalPaid={totalPaid}
                      onChange={setTotalPaid}
                    />
                  </div>

                  <BillItemList
                    items={displayItems}
                    selectedIds={selectedIds}
                    onToggle={handleToggle}
                    onToggleShared={handleToggleShared}
                  />

                  <div className="flex gap-3 animate-fade-in-up">
                    <button
                      onClick={handleReset}
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/60 backdrop-blur-sm transition hover:bg-white/10 hover:text-white/80"
                    >
                      Új számla
                    </button>
                    <button
                      onClick={handleShare}
                      disabled={sharing}
                      className="flex-1 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:shadow-fuchsia-500/40 hover:brightness-110 disabled:opacity-60 disabled:shadow-none"
                    >
                      {sharing
                        ? "Készül..."
                        : copied
                          ? "Link másolva!"
                          : "Link megosztása"}
                    </button>
                  </div>

                  {shareUrl && (
                    <div className="animate-fade-in-up rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-3.5 space-y-2 backdrop-blur-sm">
                      <p className="text-xs font-semibold text-fuchsia-300">
                        Megosztható link:
                      </p>
                      <div className="flex gap-2 items-center">
                        <input
                          readOnly
                          value={shareUrl}
                          onFocus={(e) => e.target.select()}
                          className="flex-1 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs tabular-nums text-white select-all focus:outline-none focus:border-fuchsia-400/50"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 3000);
                          }}
                          className="shrink-0 rounded-xl bg-fuchsia-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-fuchsia-400"
                        >
                          {copied ? "Másolva!" : "Másolás"}
                        </button>
                      </div>
                    </div>
                  )}
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
