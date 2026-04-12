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
    <div className="animate-fade-in-up space-y-2">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-white/40 uppercase">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        Tételek a számlán
      </h2>
      <ul className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        {items.map((item, idx) => {
          const checked = selectedIds.has(item.id);
          const sourceId = item.sourceId ?? item.id;
          const isFirstOfSource = !seenSource.has(sourceId);
          seenSource.add(sourceId);
          const showSharedToggle = onToggleShared && isFirstOfSource;

          return (
            <li
              key={item.id}
              className={idx > 0 ? "border-t border-white/5" : ""}
            >
              <label
                className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-all duration-200 ${
                  checked
                    ? "bg-fuchsia-500/15"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(item.id)}
                    className="peer sr-only"
                  />
                  <div className={`h-5 w-5 rounded-lg border-2 transition-all duration-200 ${
                    checked
                      ? "border-fuchsia-500 bg-fuchsia-500"
                      : "border-white/20 bg-white/5"
                  }`}>
                    {checked && (
                      <svg className="h-full w-full p-0.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                <span className="flex flex-1 items-center justify-between gap-2 min-w-0">
                  <span className={`truncate text-sm transition-colors ${
                    checked ? "text-white font-medium" : "text-white/70"
                  }`}>
                    {item.quantity > 1 && (
                      <span className="mr-1 text-white/40">
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
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${
                          item.isShared
                            ? "bg-amber-400/20 text-amber-300 hover:bg-amber-400/30"
                            : "bg-white/10 text-white/40 hover:bg-white/15 hover:text-white/60"
                        }`}
                        title={item.isShared ? "Közös tétel — kattints a megszüntetéshez" : "Kattints, hogy közös tétel legyen"}
                      >
                        {item.isShared ? "1 fő része" : "közös?"}
                      </button>
                    )}
                    {!showSharedToggle && item.isShared && (
                      <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-[10px] font-semibold text-amber-300">
                        1 fő része
                      </span>
                    )}
                    <span className={`text-sm font-bold tabular-nums transition-colors ${
                      checked ? "text-fuchsia-300" : "text-white/60"
                    }`}>
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
