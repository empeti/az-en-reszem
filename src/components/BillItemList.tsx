import type { BillItem } from "../types/bill";

interface Props {
  items: BillItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString("hu-HU") + " Ft";
}

export default function BillItemList({ items, selectedIds, onToggle }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
        Tételek a számlán
      </h2>
      <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
        {items.map((item) => {
          const checked = selectedIds.has(item.id);
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
                <span className="flex flex-1 items-baseline justify-between gap-2 min-w-0">
                  <span className="truncate text-sm text-gray-800">
                    {item.quantity > 1 && (
                      <span className="mr-1 font-medium text-gray-500">
                        {item.quantity}x
                      </span>
                    )}
                    {item.name}
                    {item.isShared && (
                      <span className="ml-1.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 align-middle text-[10px] font-medium text-amber-700">
                        közös
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-700">
                    {formatPrice(item.price)}
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
