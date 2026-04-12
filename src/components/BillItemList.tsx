import type { BillItem } from "../types/bill";

interface Props {
  items: BillItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleShared?: (sourceId: string) => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString("hu-HU") + " Ft";
}

export default function BillItemList({ items, selectedIds, onToggle, onToggleShared }: Props) {
  if (items.length === 0) return null;

  const seenSource = new Set<string>();

  return (
    <div className="space-y-1">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
        Tételek a számlán
      </h2>
      <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
        {items.map((item) => {
          const checked = selectedIds.has(item.id);
          const sourceId = item.sourceId ?? item.id;
          const isFirstOfSource = !seenSource.has(sourceId);
          seenSource.add(sourceId);
          const showSharedToggle = onToggleShared && isFirstOfSource;

          return (
            <li key={item.id}>
              <label
                className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition ${
                  checked ? "bg-indigo-50" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item.id)}
                  className="h-5 w-5 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex flex-1 items-center justify-between gap-2 min-w-0">
                  <span className="truncate text-sm text-gray-800">
                    {item.quantity > 1 && (
                      <span className="mr-1 font-medium text-gray-500">
                        {item.quantity}x
                      </span>
                    )}
                    {item.name}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {showSharedToggle && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleShared(sourceId);
                        }}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition ${
                          item.isShared
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                        title={item.isShared ? "Közös tétel — kattints a megszüntetéshez" : "Kattints, hogy közös tétel legyen"}
                      >
                        {item.isShared ? "1 fő része" : "közös?"}
                      </button>
                    )}
                    {!showSharedToggle && item.isShared && (
                      <span
                        className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700"
                        title="Közös tétel — csak az 1 főre eső rész adódik az összeghez"
                      >
                        1 fő része
                      </span>
                    )}
                    <span className="text-sm font-semibold tabular-nums text-gray-700">
                      {formatPrice(item.price)}
                    </span>
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
