import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Loader2, Building2 } from 'lucide-react';

import { Customer } from '../types';

interface CustomerManagementProps {
  customers: Customer[];
  onAdd: (customer: Omit<Customer, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, customer: Omit<Customer, 'id'>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function CustomerManagement({ customers, onAdd, onUpdate, onDelete }: CustomerManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    address: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      alert('Kode dan nama customer wajib diisi');
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

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData({
      code: customer.code,
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
      status: customer.status || 'active'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus customer ini?')) {
      return;
    }
    await onDelete(id);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      phone: '',
      address: '',
      status: 'active'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl">Data Customer</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Customer
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Cari customer..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">NO</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">KODE</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">NAMA</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">TELEPON</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ALAMAT</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">STATUS</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada data customer'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr key={customer.id} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                    <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{customer.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{customer.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{customer.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{customer.address || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      {customer.status === 'active' ? (
                        <span className="inline-flex px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
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
            Total Customer: <strong>{customers.length}</strong> | Aktif:{' '}
            <strong>{customers.filter((c) => c.status === 'active').length}</strong> | Nonaktif:{' '}
            <strong>{customers.filter((c) => c.status === 'inactive').length}</strong>
          </p>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl">{editingId ? 'Edit Customer' : 'Tambah Customer'}</h3>
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
                  <label className="block text-gray-700 mb-2">Kode Customer *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: CUST001"
                    disabled={saving}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Nama Customer *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nama customer"
                    disabled={saving}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">No. Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: 08123456789"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Alamat</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan alamat"
                    disabled={saving}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={saving}
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
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
