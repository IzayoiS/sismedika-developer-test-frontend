export interface Food {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  is_active: boolean;
}
