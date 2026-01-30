import { useState, useCallback } from 'react';
import { API_URL } from '../utils/api';
import { Product, Sale, Salesman, Location, Customer } from '../types';

const initialProducts: Product[] = [
    { id: '1', name: 'Mie Instan Goreng', code: 'MIG001', price: 3500, stock: 500, unit: 'pcs' },
    { id: '2', name: 'Mie Instan Kuah', code: 'MIK001', price: 3000, stock: 450, unit: 'pcs' },
    { id: '3', name: 'Kopi Sachet', code: 'KOP001', price: 2000, stock: 800, unit: 'pcs' },
    { id: '4', name: 'Teh Botol', code: 'TEH001', price: 5000, stock: 300, unit: 'botol' },
    { id: '5', name: 'Air Mineral 600ml', code: 'AIR001', price: 3500, stock: 600, unit: 'botol' },
    { id: '6', name: 'Biskuit Kaleng', code: 'BIS001', price: 15000, stock: 150, unit: 'kaleng' },
    { id: '7', name: 'Wafer Coklat', code: 'WAF001', price: 8000, stock: 200, unit: 'pcs' },
    { id: '8', name: 'Keripik Kentang', code: 'KER001', price: 10000, stock: 180, unit: 'pcs' },
];

export function useData(authToken: string | null) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [sales, setSales] = useState<Sale[]>([]);
    const [salesmen, setSalesmen] = useState<Salesman[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!authToken) return;
        try {
            setLoading(true);
            setError(null);

            // Initialize products if needed
            await fetch(`${API_URL}/init-products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            // Load products
            const productsRes = await fetch(`${API_URL}/products`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!productsRes.ok) {
                throw new Error('Failed to load products');
            }

            const productsData = await productsRes.json();
            const normalizedProducts = (productsData.products || initialProducts).map((p: any) => ({
                id: p.id,
                name: p.name,
                code: p.code,
                price: Number(p.price) || 0,
                stock: Number(p.stock) || 0,
                unit: p.unit || 'pcs',
                locationId: p.locationId ?? p.location_id ?? undefined
            }));
            setProducts(normalizedProducts);

            // Load sales
            const salesRes = await fetch(`${API_URL}/sales`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!salesRes.ok) {
                throw new Error('Failed to load sales');
            }

            const salesData = await salesRes.json();
            const normalizedSales = (salesData.sales || []).map((s: any) => ({
                ...s,
                totalAmount: Number(s.totalAmount) || 0,
                items: (s.items || []).map((i: any) => ({
                    ...i,
                    price: Number(i.price) || 0,
                    total: Number(i.total) || 0,
                    quantity: Number(i.quantity) || 0
                }))
            }));
            setSales(normalizedSales);

            // Load salesmen
            try {
                const salesmenRes = await fetch(`${API_URL}/salesmen`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                if (salesmenRes.ok) {
                    const salesmenData = await salesmenRes.json();
                    const normalizedSalesmen = (salesmenData.salesmen || []).map((s: any) => ({
                        ...s,
                        status: s.status || 'active'
                    }));
                    setSalesmen(normalizedSalesmen);
                } else {
                    setSalesmen([]);
                }
            } catch (e) {
                setSalesmen([]);
            }

            // Load locations
            try {
                const locationsRes = await fetch(`${API_URL}/locations`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                if (locationsRes.ok) {
                    const locationsData = await locationsRes.json();
                    setLocations(locationsData.locations || []);
                } else {
                    setLocations([]);
                }
            } catch (e) {
                setLocations([]);
            }

            // Load customers
            try {
                const customersRes = await fetch(`${API_URL}/customers`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                if (customersRes.ok) {
                    const customersData = await customersRes.json();
                    const normalizedCustomers = (customersData.customers || []).map((c: any) => ({
                        id: c.id,
                        code: c.code,
                        name: c.name,
                        phone: c.phone || '',
                        address: c.address || '',
                        status: c.status || 'active',
                        created_at: c.created_at
                    }));
                    setCustomers(normalizedCustomers);
                } else {
                    setCustomers([]);
                }
            } catch (e) {
                setCustomers([]);
            }

        } catch (err) {
            console.error('Error loading data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    const addSale = async (sale: Sale) => {
        if (!authToken) return false;
        try {
            const response = await fetch(`${API_URL}/sales`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sale)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save sale');
            }

            await loadData();
            return true;
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save sale');
            return false;
        }
    };

    const addSalesman = async (salesman: Omit<Salesman, 'id'>) => {
        if (!authToken) return false;
        try {
            const newSalesman = {
                id: Date.now().toString(),
                ...salesman
            };
            const response = await fetch(`${API_URL}/salesmen`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSalesman)
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.error || 'Gagal menambah salesman');
                return false;
            }
            await loadData();
            alert('Salesman berhasil ditambahkan');
            return true;
        } catch (err) {
            alert('Gagal menambah salesman');
            return false;
        }
    };

    const updateSalesman = async (id: string, salesman: Omit<Salesman, 'id'>) => {
        if (!authToken) return false;
        try {
            const response = await fetch(`${API_URL}/salesmen/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(salesman)
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.error || 'Gagal mengupdate salesman');
                return false;
            }
            await loadData();
            alert('Salesman berhasil diupdate');
            return true;
        } catch (err) {
            alert('Gagal mengupdate salesman');
            return false;
        }
    };

    const deleteSalesman = async (id: string) => {
        if (!authToken) return false;
        try {
            const response = await fetch(`${API_URL}/salesmen/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) {
                alert('Gagal menghapus salesman');
                return false;
            }
            await loadData();
            alert('Salesman berhasil dihapus');
            return true;
        } catch (err) {
            alert('Gagal menghapus salesman');
            return false;
        }
    };

    const addProduct = async (productData: any) => {
        if (!authToken) return false;
        try {
            const newProduct = {
                id: Date.now().toString(),
                ...productData
            };
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newProduct)
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.error || 'Gagal menambah produk');
                return false;
            }
            await loadData();
            alert('Produk berhasil ditambahkan');
            return true;
        } catch (err) {
            alert('Gagal menambah produk');
            return false;
        }
    };

    const updateProduct = async (id: string, productData: any) => {
        if (!authToken) return false;
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.error || 'Gagal mengupdate produk');
                return false;
            }
            await loadData();
            alert('Produk berhasil diupdate');
            return true;
        } catch (err) {
            alert('Gagal mengupdate produk');
            return false;
        }
    };

    const deleteProduct = async (id: string) => {
        if (!authToken) return;
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            return;
        }
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) {
                alert('Gagal menghapus produk');
                return;
            }
            await loadData();
            alert('Produk berhasil dihapus');
        } catch (err) {
            alert('Gagal menghapus produk');
        }
    };

    const addLocation = async (location: Omit<Location, 'id'>) => {
        if (!authToken) return false;
        try {
            const newLocation = {
                id: Date.now().toString(),
                ...location
            };
            const response = await fetch(`${API_URL}/locations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newLocation)
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.error || 'Gagal menambah lokasi');
                return false;
            }
            await loadData();
            alert('Lokasi berhasil ditambahkan');
            return true;
        } catch (err) {
            alert('Gagal menambah lokasi');
            return false;
        }
    };

    const updateLocation = async (id: string, location: Omit<Location, 'id'>) => {
        if (!authToken) return false;
        try {
            const response = await fetch(`${API_URL}/locations/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(location)
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.error || 'Gagal mengupdate lokasi');
                return false;
            }
            await loadData();
            alert('Lokasi berhasil diupdate');
            return true;
        } catch (err) {
            alert('Gagal mengupdate lokasi');
            return false;
        }
    };

    const deleteLocation = async (id: string) => {
        if (!authToken) return false;
        try {
            const response = await fetch(`${API_URL}/locations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) {
                alert('Gagal menghapus lokasi');
                return false;
            }
            await loadData();
            alert('Lokasi berhasil dihapus');
            return true;
        } catch (err) {
            alert('Gagal menghapus lokasi');
            return false;
        }
    };

    const addCustomer = async (customer: Omit<Customer, 'id'>) => {
        if (!authToken) return false;
        try {
            const response = await fetch(`${API_URL}/customers`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customer)
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.error || 'Gagal menambah customer');
                return false;
            }
            await loadData();
            alert('Customer berhasil ditambahkan');
            return true;
        } catch (err) {
            alert('Gagal menambah customer');
            return false;
        }
    };

    const updateCustomer = async (id: string, customer: Omit<Customer, 'id'>) => {
        if (!authToken) return false;
        try {
            const response = await fetch(`${API_URL}/customers/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customer)
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.error || 'Gagal mengupdate customer');
                return false;
            }
            await loadData();
            alert('Customer berhasil diupdate');
            return true;
        } catch (err) {
            alert('Gagal mengupdate customer');
            return false;
        }
    };

    const deleteCustomer = async (id: string) => {
        if (!authToken) return false;
        try {
            const response = await fetch(`${API_URL}/customers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) {
                alert('Gagal menghapus customer');
                return false;
            }
            await loadData();
            alert('Customer berhasil dihapus');
            return true;
        } catch (err) {
            alert('Gagal menghapus customer');
            return false;
        }
    };

    const clearData = () => {
        setProducts(initialProducts);
        setSales([]);
        setSalesmen([]);
        setLocations([]);
        setCustomers([]);
    };

    return {
        products,
        setProducts,
        sales,
        setSales,
        salesmen,
        locations,
        customers,
        loading,
        error,
        loadData,
        clearData,
        addSale,
        addSalesman,
        updateSalesman,
        deleteSalesman,
        addProduct,
        updateProduct,
        deleteProduct,
        addLocation,
        updateLocation,
        deleteLocation,
        addCustomer,
        updateCustomer,
        deleteCustomer
    };
}
