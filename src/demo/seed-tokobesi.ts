export type DemoRole = 'admin' | 'user';

export type DemoUser = {
  id: string;
  email: string;
  name: string;
  role: DemoRole;
  password: string;
  created_at: string;
};

export type DemoLocation = {
  id: string;
  name: string;
  code: string;
  address?: string;
  type?: string;
};

export type DemoProduct = {
  id: string;
  name: string;
  code: string;
  price: number;
  stock: number;
  unit: string;
  locationId: string | null;
};

export type DemoSalesman = {
  id: string;
  name: string;
  code: string;
  phone: string;
  area: string;
  status: 'active' | 'inactive';
};

export type DemoCustomer = {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  created_at: string;
};

export type DemoSaleItem = {
  id: number;
  saleId: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  price: number;
  total: number;
};

export type DemoSale = {
  id: string;
  salesmanName: string;
  salesmanId: string;
  customerId: string | null;
  customerName: string;
  date: string;
  totalAmount: number;
  items: DemoSaleItem[];
};

const now = new Date().toISOString();

export const DEMO_ADMIN = {
  email: 'admin@tokobesi.local',
  password: 'besi12345',
} as const;

export const seedUsers: DemoUser[] = [
  {
    id: 'besi-user-admin',
    email: 'admin@tokobesi.local',
    name: 'Admin Toko Besi',
    role: 'admin',
    password: 'besi12345',
    created_at: now,
  },
];

export const seedLocations: DemoLocation[] = [
  {
    id: 'loc-besi-001',
    name: 'Gudang Besi Utama',
    code: 'GDG-BESI',
    address: 'Jl. Industri Baja No. 7',
    type: 'warehouse',
  },
  {
    id: 'loc-besi-002',
    name: 'Toko Besi Pusat',
    code: 'TOK-BESI',
    address: 'Jl. Raya Konstruksi No. 12',
    type: 'store',
  },
  {
    id: 'loc-besi-003',
    name: 'Toko Besi Cabang',
    code: 'TOK-BESI-02',
    address: 'Jl. Perintis No. 88',
    type: 'store',
  },
];

export const seedProducts: DemoProduct[] = [
  { id: 'prod-besi-001', name: 'Paku 1 inch', code: 'PKU-001', price: 28000, stock: 200, unit: 'kg', locationId: 'loc-besi-002' },
  { id: 'prod-besi-002', name: 'Paku 2 inch', code: 'PKU-002', price: 30000, stock: 180, unit: 'kg', locationId: 'loc-besi-002' },
  { id: 'prod-besi-003', name: 'Paku Beton 2 inch', code: 'PKB-002', price: 45000, stock: 80, unit: 'kg', locationId: 'loc-besi-002' },
  { id: 'prod-besi-004', name: 'Paku Roofing', code: 'PKR-001', price: 38000, stock: 90, unit: 'kg', locationId: 'loc-besi-002' },
  { id: 'prod-besi-005', name: 'Paku Bendrat (Kawat Ikat)', code: 'KWB-001', price: 22000, stock: 300, unit: 'kg', locationId: 'loc-besi-002' },
  { id: 'prod-besi-006', name: 'Sekrup Gypsum 1 inch', code: 'SKG-001', price: 150, stock: 10000, unit: 'pcs', locationId: 'loc-besi-002' },
  { id: 'prod-besi-007', name: 'Baut Hex M10 x 50', code: 'BHT-010', price: 2500, stock: 2000, unit: 'pcs', locationId: 'loc-besi-002' },
  { id: 'prod-besi-008', name: 'Mur Hex M10', code: 'MRH-010', price: 800, stock: 4000, unit: 'pcs', locationId: 'loc-besi-002' },
  { id: 'prod-besi-009', name: 'Dynabolt M10', code: 'DNB-010', price: 6500, stock: 800, unit: 'pcs', locationId: 'loc-besi-002' },
  { id: 'prod-besi-010', name: 'Besi Siku 40x40x4mm (6m)', code: 'BSK-4040', price: 175000, stock: 120, unit: 'batang', locationId: 'loc-besi-001' },
  { id: 'prod-besi-011', name: 'Besi Hollow 40x40x1.6mm (6m)', code: 'BHL-4040', price: 130000, stock: 150, unit: 'batang', locationId: 'loc-besi-001' },
  { id: 'prod-besi-012', name: 'Plat Besi 1.2mm (1.2x2.4m)', code: 'PLT-012', price: 450000, stock: 35, unit: 'lembar', locationId: 'loc-besi-001' },
  { id: 'prod-besi-013', name: 'Wiremesh M6 (2.1x5.4m)', code: 'WRM-006', price: 550000, stock: 25, unit: 'lembar', locationId: 'loc-besi-001' },
  { id: 'prod-besi-014', name: 'Mata Gerinda Potong 4 inch', code: 'GRD-004', price: 15000, stock: 500, unit: 'pcs', locationId: 'loc-besi-003' },
  { id: 'prod-besi-015', name: 'Elektroda Las RB-26 (2.6mm)', code: 'LAS-026', price: 65000, stock: 120, unit: 'kg', locationId: 'loc-besi-003' },
];

export const seedSalesmen: DemoSalesman[] = [
  { id: 'sm-besi-001', name: 'Rizky Firmansyah', code: 'SM-BESI-01', phone: '0812-1111-2222', area: 'Kota', status: 'active' },
  { id: 'sm-besi-002', name: 'Siti Aisyah', code: 'SM-BESI-02', phone: '0813-3333-4444', area: 'Kabupaten', status: 'active' },
];

export const seedCustomers: DemoCustomer[] = [
  {
    id: 'cust-besi-001',
    code: 'CUST-BESI-001',
    name: 'CV Baja Abadi',
    phone: '021-7001001',
    address: 'Jl. Proyek No. 3',
    status: 'active',
    created_at: now,
  },
  {
    id: 'cust-besi-002',
    code: 'CUST-BESI-002',
    name: 'PT Konstruksi Maju',
    phone: '021-7001002',
    address: 'Jl. Beton Raya No. 10',
    status: 'active',
    created_at: now,
  },
  {
    id: 'cust-besi-003',
    code: 'CUST-BESI-003',
    name: 'Toko Bangunan Sejahtera',
    phone: '021-7001003',
    address: 'Jl. Perumahan Baru Blok A1',
    status: 'active',
    created_at: now,
  },
];

export const seedSales: DemoSale[] = [
  {
    id: 'sale-besi-001',
    salesmanName: 'Rizky Firmansyah',
    salesmanId: 'sm-besi-001',
    customerId: 'cust-besi-001',
    customerName: 'CV Baja Abadi',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 770000,
    items: [
      { id: 1, saleId: 'sale-besi-001', productId: 'prod-besi-003', productName: 'Paku Beton 2 inch', productCode: 'PKB-002', quantity: 5, price: 45000, total: 225000 },
      { id: 2, saleId: 'sale-besi-001', productId: 'prod-besi-005', productName: 'Paku Bendrat (Kawat Ikat)', productCode: 'KWB-001', quantity: 10, price: 22000, total: 220000 },
      { id: 3, saleId: 'sale-besi-001', productId: 'prod-besi-009', productName: 'Dynabolt M10', productCode: 'DNB-010', quantity: 50, price: 6500, total: 325000 },
    ],
  },
  {
    id: 'sale-besi-002',
    salesmanName: 'Siti Aisyah',
    salesmanId: 'sm-besi-002',
    customerId: 'cust-besi-002',
    customerName: 'PT Konstruksi Maju',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 7400000,
    items: [
      { id: 4, saleId: 'sale-besi-002', productId: 'prod-besi-010', productName: 'Besi Siku 40x40x4mm (6m)', productCode: 'BSK-4040', quantity: 20, price: 175000, total: 3500000 },
      { id: 5, saleId: 'sale-besi-002', productId: 'prod-besi-011', productName: 'Besi Hollow 40x40x1.6mm (6m)', productCode: 'BHL-4040', quantity: 30, price: 130000, total: 3900000 },
    ],
  },
  {
    id: 'sale-besi-003',
    salesmanName: 'Rizky Firmansyah',
    salesmanId: 'sm-besi-001',
    customerId: 'cust-besi-003',
    customerName: 'Toko Bangunan Sejahtera',
    date: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    totalAmount: 1950000,
    items: [
      { id: 6, saleId: 'sale-besi-003', productId: 'prod-besi-006', productName: 'Sekrup Gypsum 1 inch', productCode: 'SKG-001', quantity: 2000, price: 150, total: 300000 },
      { id: 7, saleId: 'sale-besi-003', productId: 'prod-besi-008', productName: 'Mur Hex M10', productCode: 'MRH-010', quantity: 500, price: 800, total: 400000 },
      { id: 8, saleId: 'sale-besi-003', productId: 'prod-besi-007', productName: 'Baut Hex M10 x 50', productCode: 'BHT-010', quantity: 500, price: 2500, total: 1250000 },
    ],
  },
];

