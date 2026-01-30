export interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  stock: number;
  unit: string;
  locationId?: string;
  location_id?: string; // Handle legacy backend/mock case
}

export interface SaleItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  salesmanName: string;
  salesmanId: string;
  customerId?: string;
  customerName: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface Salesman {
  id: string;
  name: string;
  code: string;
  phone: string;
  area: string;
  status: 'active' | 'inactive';
}

export interface Location {
  id: string;
  name: string;
  code: string;
  address: string;
  type: 'warehouse' | 'store';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}
