import { formatPrice, getCurrency } from "../utils/format";

interface Props {
  billTotal: number;
  totalPaid: string;
  currency: string;
  onChange: (value: string) => void;
}

export default function TipInput({ billTotal, totalPaid, currency, onChange }: Props) {
  const paid = parseFloat(totalPaid.replace(",", ".")) || 0;
  const tip = Math.round((paid - billTotal) * 100) / 100;
  const cur = getCurrency(currency);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 space-y-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="total-paid" className="text-sm font-semibold text-gray-700 shrink-0 dark:text-slate-200">
          Mennyit fizettetek?
        </label>
        <div className="relative">
          <input
            id="total-paid"
            type="number"
            inputMode="numeric"
            value={totalPaid}
            onChange={(e) => onChange(e.target.value)}
            placeholder={String(billTotal)}
            className="w-32 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 pr-10 text-right text-sm tabular-nums text-gray-800 placeholder-gray-300 shadow-sm transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-500 dark:focus:bg-slate-600 dark:focus:ring-teal-900"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none dark:text-slate-500">
            {cur.symbol}
          </span>
        </div>
      </div>
      {tip > 0 && (
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Borravaló: <span className="font-bold text-teal-600 dark:text-teal-400">{formatPrice(tip, currency)}</span>
          <span className="text-gray-400 dark:text-slate-500"> — fejenként megjelenik a tételeknél</span>
        </p>
      )}
    </div>
  );
}
