export interface Order {
  id: number;
  status: string;
  total_price: number;
  table_id: number;
  table: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
  };
  items?: OrderItem[];
  created_at?: string;
  updated_at?: string;
  opened_at?: string;
  closed_at?: string;
}

export interface OrderItem {
  food_id: number;
  food: {
    name: string;
  };
  qty: number;
  price: number;
  subtotal: number;
}
