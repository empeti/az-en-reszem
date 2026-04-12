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
    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 space-y-3 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="total-paid" className="text-sm font-semibold text-white/70 shrink-0">
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
            className="w-32 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 pr-8 text-right text-sm tabular-nums text-white placeholder-white/25 transition focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20 focus:outline-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">Ft</span>
        </div>
      </div>
      {tip > 0 && (
        <p className="text-xs text-white/40">
          Borravaló: <span className="font-bold text-emerald-400">{formatPrice(tip)}</span>
          <span className="text-white/25"> — fejenként megjelenik a tételeknél</span>
        </p>
      )}
    </div>
  );
}
