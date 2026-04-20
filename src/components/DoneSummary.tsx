import { useState } from "react";
import { formatPrice } from "../utils/format";

interface Props {
  guestName: string;
  myTotal: number;
  bankName: string;
  bankAccount: string;
  currency: string;
  onBack: () => void;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition hover:bg-teal-50 hover:border-teal-200 active:scale-[0.99] dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-teal-900/30 dark:hover:border-teal-700"
    >
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate tabular-nums dark:text-slate-200">{value}</p>
      </div>
      <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
        copied
          ? "bg-teal-100 text-teal-700 dark:bg-teal-800/40 dark:text-teal-300"
          : "bg-gray-100 text-gray-500 dark:bg-slate-600 dark:text-slate-400"
      }`}>
        {copied ? "Másolva!" : "Másolás"}
      </span>
    </button>
  );
}

export default function DoneSummary({
  guestName,
  myTotal,
  bankName,
  bankAccount,
  currency,
  onBack,
}: Props) {
  return (
    <div className="animate-fade-in-up space-y-5">
      <div className="rounded-2xl border border-teal-200 bg-teal-50 px-5 py-6 text-center space-y-2 dark:border-teal-800 dark:bg-teal-900/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-800/40">
          <svg className="h-7 w-7 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm text-teal-700 dark:text-teal-300">
          <span className="font-bold">{guestName || "Te"}</span>, a te részed:
        </p>
        <p className="text-3xl font-extrabold tracking-tight text-teal-900 dark:text-teal-100">
          {formatPrice(myTotal, currency)}
        </p>
      </div>

      {(bankName || bankAccount) && (
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase dark:text-slate-500">
            Utalási adatok
          </p>
          <div className="space-y-2">
            {bankName && <CopyField label="Kedvezményezett neve" value={bankName} />}
            {bankAccount && <CopyField label="Bankszámlaszám" value={bankAccount} />}
          </div>
          <p className="text-xs text-gray-400 text-center dark:text-slate-500">
            Kattints egy mezőre a másoláshoz
          </p>
        </div>
      )}

      <button
        onClick={onBack}
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
      >
        Vissza a tételekhez
      </button>
    </div>
  );
}
