import {
  seedCustomers,
  seedLocations,
  seedProducts,
  seedSales,
  seedSalesmen,
  seedUsers,
} from './seed-tokobesi';

export type DemoSession = {
  token: string;
  userId: string;
  created_at: string;
  expires_at: string;
};

export type DemoDb = {
  version: 1;
  users: typeof seedUsers;
  sessions: DemoSession[];
  locations: typeof seedLocations;
  products: typeof seedProducts;
  salesmen: typeof seedSalesmen;
  customers: typeof seedCustomers;
  sales: typeof seedSales;
  nextSaleItemId: number;
};

const STORAGE_KEY = 'orderapp_demo_db_v1';

function makeSeedDb(): DemoDb {
  const allSaleItemIds = seedSales.flatMap((s) => s.items.map((i) => i.id));
  const nextSaleItemId = (allSaleItemIds.length ? Math.max(...allSaleItemIds) : 0) + 1;

  return {
    version: 1,
    users: [...seedUsers],
    sessions: [],
    locations: [...seedLocations],
    products: [...seedProducts],
    salesmen: [...seedSalesmen],
    customers: [...seedCustomers],
    sales: [...seedSales],
    nextSaleItemId,
  };
}

export function loadDemoDb(): DemoDb {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = makeSeedDb();
    saveDemoDb(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as DemoDb;
    if (parsed?.version !== 1) throw new Error('Invalid demo db version');
    return parsed;
  } catch {
    const seeded = makeSeedDb();
    saveDemoDb(seeded);
    return seeded;
  }
}

export function saveDemoDb(db: DemoDb) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDemoDb() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('orderapp_token');
}

