export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  isShared: boolean;
  /** Original item id before splitting — used to trace back shared copies to source */
  sourceId?: string;
}

export interface BillData {
  items: BillItem[];
  total: number;
  currency: string;
}
