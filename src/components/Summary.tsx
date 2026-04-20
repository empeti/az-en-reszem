import type { BillItem } from "../types/bill";
import { formatPrice } from "../utils/format";

interface Props {
  items: BillItem[];
  selectedIds: Set<string>;
  billTotal: number;
  currency: string;
}

export default function Summary({ items, selectedIds, billTotal, currency }: Props) {
  const selectedItems = items.filter((i) => selectedIds.has(i.id));
  const myTotal = selectedItems.reduce((sum, i) => sum + i.price, 0);
  const pct = billTotal > 0 ? Math.round((myTotal / billTotal) * 100) : 0;

  if (selectedIds.size === 0) {
    return (
      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/80 px-4 py-5 text-center text-sm text-gray-400 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-500">
        Pipáld ki a tételeidet az összesítéshez
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/90 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-5">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-400 dark:text-slate-500">
            {selectedItems.length} tétel &middot; a számla {pct}%-a
          </p>
          <p className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
            {formatPrice(myTotal, currency)}
          </p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs text-gray-400 dark:text-slate-500">Számla összesen</p>
          <p className="text-sm font-bold text-gray-500 tabular-nums dark:text-slate-400">{formatPrice(billTotal, currency)}</p>
        </div>
      </div>
    </div>
  );
}
