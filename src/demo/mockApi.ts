import { loadDemoDb, resetDemoDb, saveDemoDb } from './storage';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function jsonResponse(body: JsonValue, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseAuthToken(req: Request) {
  const header = req.headers.get('authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  return token || null;
}

function nowIso() {
  return new Date().toISOString();
}

function uuid() {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

function unauthorized(message = 'Unauthorized') {
  return jsonResponse({ error: message }, 401);
}

function forbidden(message = 'Forbidden') {
  return jsonResponse({ error: message }, 403);
}

async function readJson(req: Request) {
  const text = await req.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function requireUser(req: Request) {
  const token = parseAuthToken(req);
  if (!token) return { ok: false as const, res: unauthorized() };

  const db = loadDemoDb();
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return { ok: false as const, res: unauthorized('Invalid token') };

  if (session.expires_at && new Date(session.expires_at) <= new Date()) {
    db.sessions = db.sessions.filter((s) => s.token !== token);
    saveDemoDb(db);
    return { ok: false as const, res: unauthorized('Session expired') };
  }

  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return { ok: false as const, res: unauthorized('Invalid session') };

  return { ok: true as const, db, token, user };
}

function isAdmin(user: any) {
  return user?.role === 'admin';
}

function sortByName(a: any, b: any) {
  return String(a?.name || '').localeCompare(String(b?.name || ''), 'id');
}

export function resetDemoData() {
  resetDemoDb();
}

export function installMockApi() {
  const originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = new Request(input, init);
    const url = new URL(req.url, globalThis.location?.origin || 'http://localhost');

    const path = url.pathname;
    const method = req.method.toUpperCase();

    const isApiPath =
      path === '/health' ||
      path.startsWith('/auth/') ||
      path === '/init-products' ||
      path === '/products' ||
      path.startsWith('/products/') ||
      path === '/sales' ||
      path === '/salesmen' ||
      path.startsWith('/salesmen/') ||
      path === '/locations' ||
      path.startsWith('/locations/') ||
      path === '/customers' ||
      path.startsWith('/customers/') ||
      path === '/users' ||
      path.startsWith('/users/');

    if (!isApiPath) return originalFetch(input, init);

    if (method === 'GET' && path === '/health') {
      return jsonResponse({ status: 'ok' });
    }

    if (method === 'POST' && path === '/auth/login') {
      const body = (await readJson(req)) as any;
      const email = String(body?.email || '').trim().toLowerCase();
      const password = String(body?.password || '');

      const db = loadDemoDb();
      const user = db.users.find((u) => u.email.toLowerCase() === email);
      if (!user || user.password !== password) return jsonResponse({ error: 'Email atau password salah' }, 400);

      const token = uuid();
      const created = nowIso();
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      db.sessions.push({ token, userId: user.id, created_at: created, expires_at: expires });
      saveDemoDb(db);

      const { password: _pw, ...safeUser } = user as any;
      return jsonResponse({ user: safeUser, token });
    }

    if (method === 'POST' && path === '/auth/signup') {
      const body = (await readJson(req)) as any;
      const email = String(body?.email || '').trim().toLowerCase();
      const password = String(body?.password || '');
      const name = String(body?.name || '').trim();
      if (!email || !password || !name) return jsonResponse({ error: 'Email, password, dan name wajib diisi' }, 400);
      if (password.length < 6) return jsonResponse({ error: 'Password minimal 6 karakter' }, 400);

      const db = loadDemoDb();
      if (db.users.some((u) => u.email.toLowerCase() === email)) return jsonResponse({ error: 'Email sudah terdaftar' }, 400);

      const id = uuid();
      const created_at = nowIso();
      const user = { id, email, name, role: 'user' as const, password, created_at };
      db.users.unshift(user as any);

      const token = uuid();
      const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      db.sessions.push({ token, userId: id, created_at, expires_at });
      saveDemoDb(db);

      const { password: _pw, ...safeUser } = user as any;
      return jsonResponse({ user: safeUser, token });
    }

    if (method === 'GET' && path === '/auth/me') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      const { password: _pw, ...safeUser } = ctx.user as any;
      return jsonResponse({ user: safeUser });
    }

    if (method === 'POST' && path === '/auth/logout') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      ctx.db.sessions = ctx.db.sessions.filter((s) => s.token !== ctx.token);
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Logged out' });
    }

    if (method === 'POST' && path === '/init-products') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      if (ctx.db.products.length > 0) return jsonResponse({ message: 'Products already initialized' });
      // If db was corrupted and products empty, re-seed by resetting db.
      resetDemoDb();
      loadDemoDb();
      return jsonResponse({ message: 'Products initialized' });
    }

    if (method === 'GET' && path === '/products') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      const products = [...ctx.db.products].sort(sortByName);
      return jsonResponse({ products });
    }

    if (method === 'POST' && path === '/products') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      const body = (await readJson(req)) as any;
      const name = String(body?.name || '').trim();
      const code = String(body?.code || '').trim().toUpperCase();
      const price = Number(body?.price);
      const stock = Number(body?.stock);
      const unit = String(body?.unit || '').trim();
      const locationId = body?.locationId ? String(body.locationId) : null;
      if (!name || !code || !Number.isFinite(price) || !Number.isFinite(stock) || !unit) {
        return jsonResponse({ error: 'Data produk belum lengkap' }, 400);
      }
      if (ctx.db.products.some((p) => p.code.toUpperCase() === code)) return jsonResponse({ error: 'Kode produk sudah ada' }, 400);
      const id = String(body?.id || uuid());
      ctx.db.products.push({ id, name, code, price, stock, unit, locationId });
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Product added', id });
    }

    if (method === 'PUT' && path.startsWith('/products/')) {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      const id = path.split('/')[2];
      const body = (await readJson(req)) as any;
      const name = String(body?.name || '').trim();
      const code = String(body?.code || '').trim().toUpperCase();
      const price = Number(body?.price);
      const stock = Number(body?.stock);
      const unit = String(body?.unit || '').trim();
      const locationId = body?.locationId ? String(body.locationId) : null;
      if (!id) return jsonResponse({ error: 'Invalid product id' }, 400);
      if (!name || !code || !Number.isFinite(price) || !Number.isFinite(stock) || !unit) {
        return jsonResponse({ error: 'Data produk belum lengkap' }, 400);
      }
      const existing = ctx.db.products.find((p) => p.id === id);
      if (!existing) return jsonResponse({ error: 'Produk tidak ditemukan' }, 404);
      if (ctx.db.products.some((p) => p.id !== id && p.code.toUpperCase() === code)) return jsonResponse({ error: 'Kode produk sudah ada' }, 400);
      Object.assign(existing, { name, code, price, stock, unit, locationId });
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Product updated' });
    }

    if (method === 'DELETE' && path.startsWith('/products/')) {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      const id = path.split('/')[2];
      if (!id) return jsonResponse({ error: 'Invalid product id' }, 400);
      ctx.db.products = ctx.db.products.filter((p) => p.id !== id);
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Product deleted' });
    }

    if (method === 'GET' && path === '/locations') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      const locations = [...ctx.db.locations].sort(sortByName);
      return jsonResponse({ locations });
    }

    if (method === 'POST' && path === '/locations') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      if (!isAdmin(ctx.user)) return forbidden();
      const body = (await readJson(req)) as any;
      const name = String(body?.name || '').trim();
      const code = String(body?.code || '').trim().toUpperCase();
      const address = String(body?.address || '').trim();
      const type = String(body?.type || 'warehouse').trim() || 'warehouse';
      if (!name || !code) return jsonResponse({ error: 'Nama dan kode lokasi wajib diisi' }, 400);
      if (ctx.db.locations.some((l) => l.code.toUpperCase() === code)) return jsonResponse({ error: 'Kode lokasi sudah ada' }, 400);
      const id = String(body?.id || uuid());
      ctx.db.locations.push({ id, name, code, address, type } as any);
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Location added', id });
    }

    if (method === 'PUT' && path.startsWith('/locations/')) {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      if (!isAdmin(ctx.user)) return forbidden();
      const id = path.split('/')[2];
      const body = (await readJson(req)) as any;
      const name = String(body?.name || '').trim();
      const code = String(body?.code || '').trim().toUpperCase();
      const address = String(body?.address || '').trim();
      const type = String(body?.type || 'warehouse').trim() || 'warehouse';
      if (!id) return jsonResponse({ error: 'Invalid location id' }, 400);
      if (!name || !code) return jsonResponse({ error: 'Nama dan kode lokasi wajib diisi' }, 400);
      const existing = ctx.db.locations.find((l) => l.id === id);
      if (!existing) return jsonResponse({ error: 'Lokasi tidak ditemukan' }, 404);
      if (ctx.db.locations.some((l) => l.id !== id && l.code.toUpperCase() === code)) return jsonResponse({ error: 'Kode lokasi sudah ada' }, 400);
      Object.assign(existing, { name, code, address, type });
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Location updated' });
    }

    if (method === 'DELETE' && path.startsWith('/locations/')) {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      if (!isAdmin(ctx.user)) return forbidden();
      const id = path.split('/')[2];
      if (!id) return jsonResponse({ error: 'Invalid location id' }, 400);
      ctx.db.locations = ctx.db.locations.filter((l) => l.id !== id);
      ctx.db.products = ctx.db.products.map((p) => (p.locationId === id ? { ...p, locationId: null } : p));
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Location deleted' });
    }

    if (method === 'GET' && path === '/salesmen') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      const salesmen = [...ctx.db.salesmen].sort(sortByName);
      return jsonResponse({ salesmen });
    }

    if (method === 'POST' && path === '/salesmen') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      if (!isAdmin(ctx.user)) return forbidden();
      const body = (await readJson(req)) as any;
      const name = String(body?.name || '').trim();
      const code = String(body?.code || '').trim().toUpperCase();
      const phone = String(body?.phone || '').trim();
      const area = String(body?.area || '').trim();
      const status = String(body?.status || 'active').trim() || 'active';
      if (!name || !code || !phone || !area) return jsonResponse({ error: 'Data salesman belum lengkap' }, 400);
      if (ctx.db.salesmen.some((s) => s.code.toUpperCase() === code)) return jsonResponse({ error: 'Kode salesman sudah ada' }, 400);
      const id = String(body?.id || uuid());
      ctx.db.salesmen.push({ id, name, code, phone, area, status } as any);
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Salesman added', id });
    }

    if (method === 'PUT' && path.startsWith('/salesmen/')) {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      if (!isAdmin(ctx.user)) return forbidden();
      const id = path.split('/')[2];
      const body = (await readJson(req)) as any;
      const name = String(body?.name || '').trim();
      const code = String(body?.code || '').trim().toUpperCase();
      const phone = String(body?.phone || '').trim();
      const area = String(body?.area || '').trim();
      const status = String(body?.status || 'active').trim() || 'active';
      if (!id) return jsonResponse({ error: 'Invalid salesman id' }, 400);
      if (!name || !code || !phone || !area) return jsonResponse({ error: 'Data salesman belum lengkap' }, 400);
      const existing = ctx.db.salesmen.find((s) => s.id === id);
      if (!existing) return jsonResponse({ error: 'Salesman tidak ditemukan' }, 404);
      if (ctx.db.salesmen.some((s) => s.id !== id && s.code.toUpperCase() === code)) return jsonResponse({ error: 'Kode salesman sudah ada' }, 400);
      Object.assign(existing, { name, code, phone, area, status });
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Salesman updated' });
    }

    if (method === 'DELETE' && path.startsWith('/salesmen/')) {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      if (!isAdmin(ctx.user)) return forbidden();
      const id = path.split('/')[2];
      if (!id) return jsonResponse({ error: 'Invalid salesman id' }, 400);
      ctx.db.salesmen = ctx.db.salesmen.filter((s) => s.id !== id);
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Salesman deleted' });
    }

    if (method === 'GET' && path === '/customers') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      const customers = [...ctx.db.customers].sort(sortByName);
      return jsonResponse({ customers });
    }

    if (method === 'POST' && path === '/customers') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      if (!isAdmin(ctx.user)) return forbidden();
      const body = (await readJson(req)) as any;
      const code = String(body?.code || '').trim().toUpperCase();
      const name = String(body?.name || '').trim();
      const phone = String(body?.phone || '').trim();
      const address = String(body?.address || '').trim();
      const status = String(body?.status || 'active').trim() || 'active';
      if (!code || !name) return jsonResponse({ error: 'Kode dan nama customer wajib diisi' }, 400);
      if (ctx.db.customers.some((c) => c.code.toUpperCase() === code)) return jsonResponse({ error: 'Kode customer sudah ada' }, 400);
      const id = String(body?.id || uuid());
      const created_at = nowIso();
      ctx.db.customers.push({ id, code, name, phone, address, status, created_at } as any);
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Customer added', id });
    }

    if (method === 'PUT' && path.startsWith('/customers/')) {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      if (!isAdmin(ctx.user)) return forbidden();
      const id = path.split('/')[2];
      const body = (await readJson(req)) as any;
      const code = String(body?.code || '').trim().toUpperCase();
      const name = String(body?.name || '').trim();
      const phone = String(body?.phone || '').trim();
      const address = String(body?.address || '').trim();
      const status = String(body?.status || 'active').trim() || 'active';
      if (!id) return jsonResponse({ error: 'Invalid customer id' }, 400);
      if (!code || !name) return jsonResponse({ error: 'Kode dan nama customer wajib diisi' }, 400);
      const existing = ctx.db.customers.find((c) => c.id === id);
      if (!existing) return jsonResponse({ error: 'Customer tidak ditemukan' }, 404);
      if (ctx.db.customers.some((c) => c.id !== id && c.code.toUpperCase() === code)) return jsonResponse({ error: 'Kode customer sudah ada' }, 400);
      Object.assign(existing, { code, name, phone, address, status });
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Customer updated' });
    }

    if (method === 'DELETE' && path.startsWith('/customers/')) {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      if (!isAdmin(ctx.user)) return forbidden();
      const id = path.split('/')[2];
      if (!id) return jsonResponse({ error: 'Invalid customer id' }, 400);
      ctx.db.customers = ctx.db.customers.filter((c) => c.id !== id);
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Customer deleted' });
    }

    if (method === 'POST' && path === '/sales') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      const body = (await readJson(req)) as any;
      const salesmanName = String(body?.salesmanName || '').trim();
      const salesmanId = String(body?.salesmanId || '').trim();
      const customerId = String(body?.customerId || '').trim();
      let customerName = String(body?.customerName || '').trim();
      const items = Array.isArray(body?.items) ? body.items : null;
      if (!salesmanName || !items || items.length === 0) return jsonResponse({ error: 'Data penjualan tidak lengkap' }, 400);

      let resolvedCustomerId: string | null = null;
      if (customerId) {
        const cust = ctx.db.customers.find((c) => c.id === customerId);
        if (!cust) return jsonResponse({ error: 'Customer tidak ditemukan' }, 400);
        resolvedCustomerId = cust.id;
        customerName = cust.name;
      }
      if (!customerName) return jsonResponse({ error: 'Nama customer wajib diisi' }, 400);

      const saleId = uuid();
      let totalAmount = 0;
      const normalizedItems: any[] = [];

      for (const item of items) {
        const productId = String(item?.productId || '').trim();
        const quantity = Number(item?.quantity);
        if (!productId || !Number.isFinite(quantity) || quantity <= 0) return jsonResponse({ error: 'Item penjualan tidak valid' }, 400);
        const product = ctx.db.products.find((p) => p.id === productId);
        if (!product) return jsonResponse({ error: `Produk ${productId} tidak ditemukan` }, 400);
        if (product.stock < quantity) return jsonResponse({ error: `Stok produk ${product.code} tidak mencukupi` }, 400);

        let price = Number(item.price);
        if (!Number.isFinite(price) || price < 0) {
          price = Number(product.price) || 0;
        }
        const total = price * quantity;
        totalAmount += total;
        product.stock -= quantity;

        const saleItemId = ctx.db.nextSaleItemId++;
        normalizedItems.push({
          id: saleItemId,
          saleId,
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          quantity,
          price,
          total,
        });
      }

      ctx.db.sales.unshift({
        id: saleId,
        salesmanName,
        salesmanId,
        customerId: resolvedCustomerId,
        customerName,
        date: nowIso(),
        totalAmount,
        items: normalizedItems,
      } as any);

      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'Sale saved', saleId });
    }

    if (method === 'GET' && path === '/sales') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      const sales = [...ctx.db.sales].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return jsonResponse({ sales });
    }

    if (method === 'GET' && path === '/users') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      if (!isAdmin(ctx.user)) return forbidden();
      const users = [...ctx.db.users]
        .map((u: any) => {
          const { password: _pw, ...safe } = u;
          return safe;
        })
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return jsonResponse({ users });
    }

    if (method === 'POST' && path === '/users') {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      if (!isAdmin(ctx.user)) return forbidden();
      const body = (await readJson(req)) as any;
      const email = String(body?.email || '').trim().toLowerCase();
      const password = String(body?.password || '');
      const name = String(body?.name || '').trim();
      const role = body?.role === 'admin' ? 'admin' : 'user';
      if (!email || !password || !name) return jsonResponse({ error: 'Data user tidak lengkap' }, 400);
      if (password.length < 6) return jsonResponse({ error: 'Password minimal 6 karakter' }, 400);
      if (ctx.db.users.some((u) => u.email.toLowerCase() === email)) return jsonResponse({ error: 'Email sudah terdaftar' }, 400);
      const id = uuid();
      const created_at = nowIso();
      ctx.db.users.unshift({ id, email, name, role, password, created_at } as any);
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'User created', id });
    }

    if (method === 'PUT' && path.startsWith('/users/')) {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      const id = path.split('/')[2];
      if (!id) return jsonResponse({ error: 'Missing user id' }, 400);
      if (!isAdmin(ctx.user) && ctx.user.id !== id) return forbidden();
      const body = (await readJson(req)) as any;

      const user = ctx.db.users.find((u: any) => u.id === id);
      if (!user) return jsonResponse({ error: 'User tidak ditemukan' }, 404);

      const name = body?.name != null ? String(body.name || '').trim() : null;
      const password = body?.password != null ? String(body.password || '') : null;
      const role = body?.role;

      let updated = false;
      if (name) {
        user.name = name;
        updated = true;
      }
      if (password) {
        if (password.length < 6) return jsonResponse({ error: 'Password minimal 6 karakter' }, 400);
        user.password = password;
        updated = true;
      }
      if (role != null && isAdmin(ctx.user)) {
        if (role !== 'admin' && role !== 'user') return jsonResponse({ error: 'Role tidak valid' }, 400);
        user.role = role;
        updated = true;
      }
      if (!updated) return jsonResponse({ error: 'Tidak ada data yang diubah' }, 400);

      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'User updated' });
    }

    if (method === 'DELETE' && path.startsWith('/users/')) {
      const ctx = requireUser(req);
      if (!ctx.ok) return ctx.res;
      if (!isAdmin(ctx.user)) return forbidden();
      const id = path.split('/')[2];
      if (!id) return jsonResponse({ error: 'Invalid user id' }, 400);
      ctx.db.users = ctx.db.users.filter((u: any) => u.id !== id);
      ctx.db.sessions = ctx.db.sessions.filter((s) => s.userId !== id);
      saveDemoDb(ctx.db);
      return jsonResponse({ message: 'User deleted' });
    }

    return jsonResponse({ error: 'Not found' }, 404);
  };
}

