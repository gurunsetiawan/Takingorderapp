import { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, X, Save, Loader2, Warehouse, Store } from 'lucide-react';

import { Location } from '../types';

interface LocationManagementProps {
  locations: Location[];
  onAdd: (location: Omit<Location, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, location: Omit<Location, 'id'>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function LocationManagement({ locations, onAdd, onUpdate, onDelete }: LocationManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    type: 'warehouse' as 'warehouse' | 'store'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.address) {
      alert('Semua field harus diisi');
      return;
    }

    setSaving(true);
    let success = false;

    if (editingId) {
      success = await onUpdate(editingId, formData);
    } else {
      success = await onAdd(formData);
    }

    setSaving(false);

    if (success) {
      resetForm();
    }
  };

  const handleEdit = (location: Location) => {
    setEditingId(location.id);
    setFormData({
      code: location.code,
      name: location.name,
      address: location.address,
      type: location.type
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus lokasi ini?')) {
      return;
    }

    await onDelete(id);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      address: '',
      type: 'warehouse'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredLocations = locations.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl">Manajemen Lokasi</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Lokasi
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Cari lokasi..."
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">NO</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">KODE</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">NAMA</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ALAMAT</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">TIPE</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada data lokasi'}
                  </td>
                </tr>
              ) : (
                filteredLocations.map((location, index) => (
                  <tr
                    key={location.id}
                    className={index % 2 === 0 ? 'bg-purple-50' : 'bg-white'}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{location.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{location.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{location.address}</td>
                    <td className="px-4 py-3 text-center">
                      {location.type === 'warehouse' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          <Warehouse className="w-3 h-3" />
                          Gudang
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          <Store className="w-3 h-3" />
                          Toko
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(location)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(location.id)}
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
            Total Lokasi: <strong>{locations.length}</strong> |
            Gudang: <strong>{locations.filter(l => l.type === 'warehouse').length}</strong> |
            Toko: <strong>{locations.filter(l => l.type === 'store').length}</strong>
          </p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl">
                  {editingId ? 'Edit Lokasi' : 'Tambah Lokasi'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={saving}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Kode Lokasi *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: WH001"
                    disabled={saving}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Nama Lokasi *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nama lokasi"
                    disabled={saving}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Alamat *</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan alamat lengkap"
                    disabled={saving}
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Tipe *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'warehouse' | 'store' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={saving}
                  >
                    <option value="warehouse">Gudang</option>
                    <option value="store">Toko</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
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
      )}
    </div>
  );
}
