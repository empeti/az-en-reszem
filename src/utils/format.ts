export interface Currency {
  code: string;
  label: string;
  symbol: string;
  symbolBefore: boolean;
  decimals: number;
}

export const CURRENCIES: Currency[] = [
  { code: "HUF", label: "Magyar forint",    symbol: "Ft",  symbolBefore: false, decimals: 0 },
  { code: "EUR", label: "Euro",             symbol: "€",   symbolBefore: true,  decimals: 2 },
  { code: "USD", label: "US dollár",        symbol: "$",   symbolBefore: true,  decimals: 2 },
  { code: "GBP", label: "Font sterling",    symbol: "£",   symbolBefore: true,  decimals: 2 },
  { code: "CHF", label: "Svájci frank",     symbol: "CHF", symbolBefore: false, decimals: 2 },
  { code: "CZK", label: "Cseh korona",      symbol: "Kč",  symbolBefore: false, decimals: 0 },
  { code: "PLN", label: "Lengyel zloty",    symbol: "zł",  symbolBefore: false, decimals: 2 },
  { code: "RON", label: "Román lej",        symbol: "lei", symbolBefore: false, decimals: 2 },
  { code: "RSD", label: "Szerb dinár",      symbol: "din", symbolBefore: false, decimals: 0 },
];

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function formatPrice(price: number, currencyCode = "HUF"): string {
  const cur = getCurrency(currencyCode);
  const formatted = price.toLocaleString("hu-HU", {
    minimumFractionDigits: cur.decimals,
    maximumFractionDigits: cur.decimals,
  });
  return cur.symbolBefore ? `${cur.symbol} ${formatted}` : `${formatted} ${cur.symbol}`;
}
