export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface BillData {
  items: BillItem[];
  total: number;
}
