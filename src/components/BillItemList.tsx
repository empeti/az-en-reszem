import type { BillItem } from "../types/bill";
import type { Claim } from "../services/share";
import { formatPrice } from "../utils/format";

interface Props {
  items: BillItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleShared?: (sourceId: string) => void;
  claimedItemIds?: Set<string>;
  claims?: Claim[];
  currency?: string;
}

function getClaimantName(itemId: string, claims: Claim[]): string | null {
  for (const claim of claims) {
    if (claim.itemIds.includes(itemId)) return claim.name;
  }
  return null;
}

export default function BillItemList({
  items,
  selectedIds,
  onToggle,
  onToggleShared,
  claimedItemIds,
  claims,
  currency = "HUF",
}: Props) {
  if (items.length === 0) return null;

  const seenSource = new Set<string>();
  const isOwnerView = !!onToggleShared;
  const isOwnerDashboard = isOwnerView && !!claims;

  return (
    <div className="animate-fade-in-up space-y-2">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        Tételek a számlán
      </h2>
      <ul className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {items.map((item, idx) => {
          const checked = selectedIds.has(item.id);
          const sourceId = item.sourceId ?? item.id;
          const isFirstOfSource = !seenSource.has(sourceId);
          seenSource.add(sourceId);
          const showSharedToggle = onToggleShared && isFirstOfSource && !isOwnerDashboard;
          const isClaimed = claimedItemIds?.has(item.id) ?? false;
          const claimant = isOwnerDashboard && claims ? getClaimantName(item.id, claims) : null;

          if (isOwnerView) {
            return (
              <li
                key={item.id}
                className={`${idx > 0 ? "border-t border-gray-100" : ""} ${
                  isClaimed ? "bg-emerald-50" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <span className={`truncate text-sm ${isClaimed ? "text-gray-500" : "text-gray-700"}`}>
                      {item.quantity > 1 && (
                        <span className="mr-1 text-gray-400">{item.quantity}x</span>
                      )}
                      {item.name}
                    </span>
                    {claimant && (
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        {claimant}
                      </p>
                    )}
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    {showSharedToggle && (
                      <button
                        type="button"
                        onClick={() => onToggleShared!(sourceId)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${
                          item.isShared
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        }`}
                        title={item.isShared ? "Közös tétel — kattints a megszüntetéshez" : "Kattints, hogy közös tétel legyen"}
                      >
                        {item.isShared ? "1 fő része" : "közös?"}
                      </button>
                    )}
                    {!showSharedToggle && item.isShared && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                        1 fő része
                      </span>
                    )}
                    <span className={`text-sm font-bold tabular-nums ${isClaimed ? "text-emerald-600" : "text-gray-500"}`}>
                      {formatPrice(item.price, currency)}
                    </span>
                  </span>
                </div>
              </li>
            );
          }

          return (
            <li
              key={item.id}
              className={idx > 0 ? "border-t border-gray-100" : ""}
            >
              <label
                className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-all duration-200 ${
                  checked ? "bg-teal-50" : "hover:bg-gray-50"
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
                      ? "border-teal-500 bg-teal-500"
                      : "border-gray-300 bg-white"
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
                    checked ? "text-gray-900 font-medium" : "text-gray-600"
                  }`}>
                    {item.quantity > 1 && (
                      <span className="mr-1 text-gray-400">{item.quantity}x</span>
                    )}
                    {item.name}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {item.isShared && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                        1 fő része
                      </span>
                    )}
                    <span className={`text-sm font-bold tabular-nums transition-colors ${
                      checked ? "text-teal-600" : "text-gray-500"
                    }`}>
                      {formatPrice(item.price, currency)}
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
