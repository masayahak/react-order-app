export interface User {
  user_id: number;
  username: string;
  role: 'Administrator' | 'User';
}

export interface Customer {
  customer_id: number;
  customer_name: string;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  product_code: string;
  product_name: string;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  order_id: number;
  customer_id: number;
  customer_name: string;
  order_date: string;
  total_amount: number;
  version: number;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail {
  detail_id: number;
  order_id: number;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface OrderWithDetails extends Order {
  details: OrderDetail[];
}






