interface Props {
  billTotal: number;
  totalPaid: string;
  onChange: (value: string) => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString("hu-HU") + " Ft";
}

export default function TipInput({ billTotal, totalPaid, onChange }: Props) {
  const paid = Number(totalPaid) || 0;
  const tip = paid - billTotal;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="total-paid" className="text-sm font-medium text-gray-700 shrink-0">
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
            className="w-32 rounded-xl border border-gray-300 px-3 py-2 pr-8 text-right text-sm tabular-nums shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Ft</span>
        </div>
      </div>
      {tip > 0 && (
        <p className="text-xs text-gray-500">
          Borravaló: <span className="font-semibold text-gray-700">{formatPrice(tip)}</span>
          <span className="text-gray-400"> — fejenként megjelenik a tételeknél</span>
        </p>
      )}
    </div>
  );
}
