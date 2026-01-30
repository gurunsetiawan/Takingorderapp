import { useState, useEffect } from 'react';
import { Product } from '../types';
import { Package, AlertCircle, Plus, Edit2, Trash2, Search, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import type { Location } from './AddProductModal';

interface ProductListProps {
  products: Product[];
  locations: Location[];
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(window.innerWidth < 768 ? 'grid' : 'list');

  // Handle window resize to auto-switch view mode if needed (optional, but good for UX)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid');
      } else {
        setViewMode('list');
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl">Daftar Produk</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Tampilan Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Tampilan List"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onAddProduct}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Cari produk..."
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-50 bg-white"
            >
              <option value="">Semua Lokasi</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.code} - {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-50 bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="available">Tersedia</option>
              <option value="low">Stok Rendah</option>
              <option value="out">Habis</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'grid' ? (
          /* Card View (Mobile Optimized) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="font-medium">
                  {searchTerm || filterLocation || filterStatus !== 'all'
                    ? 'Tidak ada produk yang sesuai filter'
                    : 'Belum ada data produk'}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  {/* Header: Icon + Name + Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2" title={product.name}>
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 font-mono">{product.code}</p>
                      </div>
                    </div>
                    {product.stock === 0 ? (
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium whitespace-nowrap border border-red-100">Habis</span>
                    ) : product.stock < 100 ? (
                      <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium whitespace-nowrap border border-yellow-100">Low</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium whitespace-nowrap border border-green-100">Tersedia</span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs text-gray-500">Harga</span>
                      <span className="text-sm font-bold text-gray-900">Rp {product.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-xs text-gray-500">Stok</span>
                      <span className="text-sm font-medium text-gray-700">
                        {product.stock} <span className="text-xs text-gray-400 font-normal">{product.unit}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Lokasi</span>
                      <span className="text-xs font-medium text-gray-700 truncate max-w-[150px]" title={getLocationName(product.locationId || '')}>
                        {getLocationName(product.locationId || '').split(' - ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* List View (Table) */
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">NO</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">KODE</th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      NAMA PRODUK
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      HARGA
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      STOK
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">LOKASI</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 whitespace-nowrap">STATUS</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 whitespace-nowrap">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
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
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono">{product.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{product.name}</td>
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
                          <span className="inline-flex px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            Habis
                          </span>
                        ) : product.stock < 100 ? (
                          <span className="inline-flex px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Stok Rendah
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Tersedia
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
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
        )}

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-gray-700 text-sm flex flex-wrap gap-x-4 gap-y-2">
            <span>Total: <strong>{products.length}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Tampil: <strong>{filteredProducts.length}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Stok Rendah: <strong className="text-yellow-700">{lowStockProducts.length}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Nilai Aset: <strong>Rp {products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString('id-ID')}</strong></span>
          </p>
        </div>
      </div>
    </div>
  );
}