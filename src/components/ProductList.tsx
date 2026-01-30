import { useState } from 'react';
import { Product, Location } from '../types';
import { Package, AlertCircle, Plus, Edit2, Trash2, Search, ArrowUpDown } from 'lucide-react';


interface ProductListProps {
  products: Product[];
  locations: Location[];
  userRole: 'admin' | 'user';
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export function ProductList({ products, locations, onAddProduct, onEditProduct, onDeleteProduct }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get location name by ID
  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    return location ? `${location.code} - ${location.name}` : '-';
  };

  // Filter products
  let filteredProducts = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchLocation = !filterLocation || p.locationId === filterLocation;

    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'available' && p.stock > 0) ||
      (filterStatus === 'low' && p.stock > 0 && p.stock < 100) ||
      (filterStatus === 'out' && p.stock === 0);

    return matchSearch && matchLocation && matchStatus;
  });

  // Sort products
  filteredProducts.sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'price') {
      comparison = a.price - b.price;
    } else if (sortBy === 'stock') {
      comparison = a.stock - b.stock;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 100);

  const handleSort = (field: 'name' | 'price' | 'stock') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Low Stock Warning */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <p>
              <strong>{lowStockProducts.length}</strong> produk dengan stok rendah (dibawah 100)
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl">Daftar Produk</h2>
          </div>
          <button
            onClick={onAddProduct}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cari produk..."
              />
            </div>
          </div>

          <div>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Lokasi</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.code} - {location.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="available">Tersedia</option>
              <option value="low">Stok Rendah</option>
              <option value="out">Habis</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">NO</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">KODE</th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    NAMA PRODUK
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-end gap-1">
                    HARGA
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center justify-end gap-1">
                    STOK
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">LOKASI</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">STATUS</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm || filterLocation || filterStatus !== 'all'
                      ? 'Tidak ada produk yang sesuai filter'
                      : 'Belum ada data produk'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className={index % 2 === 0 ? 'bg-green-50' : 'bg-white'}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{product.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {product.price.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {product.stock} {product.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {getLocationName(product.locationId || '')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {product.stock === 0 ? (
                        <span className="inline-flex px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          Habis
                        </span>
                      ) : product.stock < 100 ? (
                        <span className="inline-flex px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          Stok Rendah
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Tersedia
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-700 text-sm">
            Total Produk: <strong>{products.length}</strong> |
            Ditampilkan: <strong>{filteredProducts.length}</strong> |
            Stok Rendah: <strong>{lowStockProducts.length}</strong> |
            Total Nilai Stok: <strong>Rp {products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString('id-ID')}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}