export interface Product {
    id: string;
    name: string;
    code: string;
    price: number;
    stock: number;
    unit: string;
    locationId?: string;
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

export interface Location {
    id: string;
    name: string;
    code: string;
    address: string;
    type: 'warehouse' | 'store';
}

export interface Salesman {
    id: string;
    name: string;
    code: string;
    phone: string;
    area: string;
    status: 'active' | 'inactive';
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
    created_at?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}
