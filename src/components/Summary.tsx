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
      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/80 px-4 py-4 text-center text-sm text-gray-400 backdrop-blur-lg">
        Pipáld ki a tételeidet az összesítéshez
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">
            {selectedItems.length} tétel &middot; a számla {pct}%-a
          </p>
          <p className="text-2xl font-bold tracking-tight text-gray-900">
            {formatPrice(myTotal)}
          </p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>Számla összesen</p>
          <p className="font-medium text-gray-600">{formatPrice(billTotal)}</p>
        </div>
      </div>
    </div>
  );
}
