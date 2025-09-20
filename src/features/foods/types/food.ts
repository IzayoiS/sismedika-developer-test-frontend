export interface Food {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  is_active: boolean;
}

export interface FormData {
  name: string;
  price: number;
  description: string;
  category: string;
  is_active: boolean;
}

export interface FormErrors {
  name?: string;
  price?: string;
  category?: string;
  description?: string;
  is_active?: string;
}
