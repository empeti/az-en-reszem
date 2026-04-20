import type { Claim } from "../services/share";
import { formatPrice } from "../utils/format";

interface Props {
  claims: Claim[];
  currency: string;
}

export default function ClaimsSummary({ claims, currency }: Props) {
  if (claims.length === 0) {
    return (
      <div className="animate-fade-in-up rounded-2xl border border-gray-200 bg-white px-5 py-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-gray-400 dark:text-slate-500">Még senki nem jelölte meg a tételeit.</p>
      </div>
    );
  }

  const grandTotal = claims.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="animate-fade-in-up space-y-2">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-400 uppercase dark:text-slate-500">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2.25 2.25 0 013 16.878c0-1.032.328-1.99.893-2.77A5.973 5.973 0 0112 12a5.973 5.973 0 018.107 2.108c.565.78.893 1.738.893 2.77A2.25 2.25 0 0118.772 19.128H15zM12 9.75a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
        Ki mennyit fizet
      </h2>
      <ul className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {claims.map((claim, idx) => (
          <li
            key={idx}
            className={`flex items-center justify-between px-4 py-3.5 ${
              idx > 0 ? "border-t border-gray-100 dark:border-slate-700" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate dark:text-slate-200">{claim.name}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">{claim.itemIds.length} tétel</p>
            </div>
            <span className="text-sm font-bold tabular-nums text-teal-600 dark:text-teal-400">
              {formatPrice(claim.total, currency)}
            </span>
          </li>
        ))}
        <li className="flex items-center justify-between border-t-2 border-gray-200 bg-gray-50 px-4 py-3.5 dark:border-slate-600 dark:bg-slate-700/50">
          <span className="text-sm font-semibold text-gray-600 dark:text-slate-300">Összesen bejelentve</span>
          <span className="text-sm font-extrabold tabular-nums text-gray-900 dark:text-slate-100">
            {formatPrice(grandTotal, currency)}
          </span>
        </li>
      </ul>
    </div>
  );
}
