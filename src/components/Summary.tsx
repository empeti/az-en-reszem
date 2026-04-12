import type { BillItem } from "../types/bill";

interface Props {
  items: BillItem[];
  selectedIds: Set<string>;
  billTotal: number;
}

function formatPrice(price: number): string {
  return price.toLocaleString("hu-HU") + " Ft";
}

export default function Summary({ items, selectedIds, billTotal }: Props) {
  const selectedItems = items.filter((i) => selectedIds.has(i.id));
  const myTotal = selectedItems.reduce((sum, i) => sum + i.price, 0);
  const pct = billTotal > 0 ? Math.round((myTotal / billTotal) * 100) : 0;

  if (selectedIds.size === 0) {
    return (
      <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-black/40 px-4 py-5 text-center text-sm text-white/30 backdrop-blur-xl">
        Pipáld ki a tételeidet az összesítéshez
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-5">
        <div className="space-y-1">
          <p className="text-xs font-medium text-white/40">
            {selectedItems.length} tétel &middot; a számla {pct}%-a
          </p>
          <p className="text-3xl font-extrabold tracking-tight text-white">
            {formatPrice(myTotal)}
          </p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs text-white/30">Számla összesen</p>
          <p className="text-sm font-bold text-white/50 tabular-nums">{formatPrice(billTotal)}</p>
        </div>
      </div>
    </div>
  );
}
