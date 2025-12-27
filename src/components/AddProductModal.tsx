import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

export interface Location {
  id: string;
  name: string;
  code: string;
  address: string;
  type: 'warehouse' | 'store';
}

interface AddProductModalProps {
  onClose: () => void;
  onSubmit: (product: any) => Promise<boolean>;
  locations: Location[];
  editProduct?: any;
}

export function AddProductModal({ onClose, onSubmit, locations, editProduct }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    price: '',
    stock: '',
    unit: 'pcs',
    locationId: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editProduct) {
      setFormData({
        code: editProduct.code,
        name: editProduct.name,
        price: editProduct.price.toString(),
        stock: editProduct.stock.toString(),
        unit: editProduct.unit,
        locationId: editProduct.locationId || '',
      });
    }
  }, [editProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.price || !formData.stock) {
      alert('Semua field harus diisi');
      return;
    }

    setSaving(true);
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    };

    const success = await onSubmit(productData);
    setSaving(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl">
              {editProduct ? 'Edit Produk' : 'Tambah Produk'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={saving}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm">Kode Produk *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: PRD001"
                disabled={saving || !!editProduct}
                required
              />
              {editProduct && (
                <p className="text-xs text-gray-500 mt-1">Kode produk tidak dapat diubah</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">Nama Produk *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama produk"
                disabled={saving}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">Harga *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan harga"
                disabled={saving}
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">Stok *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan jumlah stok"
                disabled={saving}
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">Satuan *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving}
              >
                <option value="pcs">Pcs</option>
                <option value="box">Box</option>
                <option value="karton">Karton</option>
                <option value="botol">Botol</option>
                <option value="kaleng">Kaleng</option>
                <option value="kg">Kg</option>
                <option value="liter">Liter</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">Lokasi</label>
              <select
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving}
              >
                <option value="">Pilih lokasi...</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.code} - {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
