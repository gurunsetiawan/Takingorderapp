import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { SalesHistory } from './components/SalesHistory';
import { Login } from './components/Login';
import { SalesmanList } from './components/SalesmanList';
import { SalesEntryModal } from './components/SalesEntryModal';
import { ManageUsers } from './components/ManageUsers';
import { LocationManagement } from './components/LocationManagement';
import { CustomerManagement } from './components/CustomerManagement';
import { UserProfile } from './components/UserProfile';
import { AddProductModal } from './components/AddProductModal';
import { LayoutDashboard, Package, ShoppingCart, Loader2, LogOut, Users, Shield, MapPin, UserCircle, Building2, Menu, ChevronDown } from 'lucide-react';
import { IS_DEMO } from './utils/api';
import { useIsMobile } from './components/ui/use-mobile';
import { resetDemoData } from './demo/mockApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { useAuth } from './hooks/useAuth';
import { useData } from './hooks/useData';
import { Product } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sales' | 'products' | 'salesmen' | 'users' | 'locations' | 'customers' | 'profile'>('dashboard');
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  const { user, userRole, authToken, loading: authLoading, login, signup, logout } = useAuth();
  const {
    products,
    sales,
    salesmen,
    locations,
    customers,
    loading: dataLoading,
    loadData,
    addSale,
    addProduct,
    updateProduct,
    deleteProduct,
    addSalesman,
    updateSalesman,
    deleteSalesman,
    addLocation,
    updateLocation,
    deleteLocation,
    addCustomer,
    updateCustomer,
    deleteCustomer
  } = useData(authToken);

  const canAccessTab = (tab: string) => {
    if (userRole === 'admin') return true;
    return ['dashboard', 'sales', 'products', 'profile'].includes(tab);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpenMobile((open) => !open);
    } else {
      setSidebarCollapsed((collapsed) => !collapsed);
    }
  };

  const closeMobileSidebar = () => setSidebarOpenMobile(false);
  const showDemoReset = IS_DEMO && userRole === 'admin';

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpenMobile(false);
    }
  }, [isMobile]);

  // Initialize and load data
  useEffect(() => {
    if (user && authToken) {
      loadData();
    }
  }, [user, authToken, loadData]);

  useEffect(() => {
    if (!user) return;
    if (!canAccessTab(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, canAccessTab]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddProductModal(true);
  };

  const handleUpdateProductWrapper = async (data: any) => {
    if (!editingProduct) return false;
    const success = await updateProduct(editingProduct.id, data);
    if (success) {
      setEditingProduct(undefined);
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    // Reset local UI state
    setEditingProduct(undefined);
    setShowAddProductModal(false);
    setShowSalesModal(false);
  };

  // Show login screen if not authenticated
  if (!user && !authLoading) {
    return <Login onLogin={login} onSignup={signup} />;
  }

  if (authLoading || (user && dataLoading && products.length === 0 && sales.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <aside
          className={`bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-64'
            }`}
        >
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
            {!sidebarCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                OrderApp
              </span>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${activeTab === 'dashboard'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              title={sidebarCollapsed ? "Dashboard" : undefined}
            >
              <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
            </button>

            <button
              onClick={() => setActiveTab('sales')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${activeTab === 'sales'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              title={sidebarCollapsed ? "Penjualan" : undefined}
            >
              <ShoppingCart className={`w-5 h-5 ${activeTab === 'sales' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {!sidebarCollapsed && <span className="font-medium">Penjualan</span>}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${activeTab === 'products'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              title={sidebarCollapsed ? "Produk" : undefined}
            >
              <Package className={`w-5 h-5 ${activeTab === 'products' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {!sidebarCollapsed && <span className="font-medium">Produk</span>}
            </button>

            <button
              onClick={() => setActiveTab('salesmen')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${activeTab === 'salesmen'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              title={sidebarCollapsed ? "Salesman" : undefined}
            >
              <Users className={`w-5 h-5 ${activeTab === 'salesmen' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {!sidebarCollapsed && <span className="font-medium">Salesman</span>}
            </button>

            <button
              onClick={() => setActiveTab('locations')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${activeTab === 'locations'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              title={sidebarCollapsed ? "Lokasi" : undefined}
            >
              <MapPin className={`w-5 h-5 ${activeTab === 'locations' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {!sidebarCollapsed && <span className="font-medium">Lokasi</span>}
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${activeTab === 'customers'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              title={sidebarCollapsed ? "Customer" : undefined}
            >
              <Building2 className={`w-5 h-5 ${activeTab === 'customers' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {!sidebarCollapsed && <span className="font-medium">Customer</span>}
            </button>

            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${activeTab === 'users'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                title={sidebarCollapsed ? "User Management" : undefined}
              >
                <Shield className={`w-5 h-5 ${activeTab === 'users' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {!sidebarCollapsed && <span className="font-medium">Kelola User</span>}
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Mobile Header & Sidebar Overlay */}
      {isMobile && (
        <>
          <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-30">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              OrderApp
            </span>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
          </header>

          {/* Mobile Sidebar */}
          {sidebarOpenMobile && (
            <div className="fixed inset-0 z-40 flex">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={closeMobileSidebar}
              />
              <div className="relative w-64 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Menu
                  </span>
                </div>
                <div className="p-3 space-y-1 flex-1 overflow-y-auto">
                  <button
                    onClick={() => { setActiveTab('dashboard'); closeMobileSidebar(); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('sales'); closeMobileSidebar(); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg ${activeTab === 'sales' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-medium">Penjualan</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('products'); closeMobileSidebar(); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg ${activeTab === 'products' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                  >
                    <Package className="w-5 h-5" />
                    <span className="font-medium">Produk</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('salesmen'); closeMobileSidebar(); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg ${activeTab === 'salesmen' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Salesman</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('locations'); closeMobileSidebar(); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg ${activeTab === 'locations' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                  >
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">Lokasi</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('customers'); closeMobileSidebar(); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg ${activeTab === 'customers' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="font-medium">Customer</span>
                  </button>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => { setActiveTab('users'); closeMobileSidebar(); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg ${activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                    >
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Kelola User</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isMobile ? 'mt-16' : (sidebarCollapsed ? 'ml-16' : 'ml-64')
          }`}
      >
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'sales' && 'Data Penjualan'}
              {activeTab === 'products' && 'Data Produk'}
              {activeTab === 'salesmen' && 'Data Salesman'}
              {activeTab === 'users' && 'Manajemen User'}
              {activeTab === 'locations' && 'Data Lokasi'}
              {activeTab === 'customers' && 'Data Customer'}
              {activeTab === 'profile' && 'Profil Saya'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'dashboard' && `Halo, ${user?.name}`}
              {activeTab === 'sales' && 'Kelola transaksi penjualan'}
              {activeTab === 'products' && 'Kelola stok dan harga produk'}
              {activeTab === 'salesmen' && 'Kelola tim penjualan'}
              {activeTab === 'users' && 'Kelola akses pengguna aplikasi'}
              {activeTab === 'locations' && 'Kelola gudang dan lokasi'}
              {activeTab === 'customers' && 'Kelola data pelanggan'}
              {activeTab === 'profile' && 'Kelola data akun Anda'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {showDemoReset && (
              <button
                onClick={() => {
                  if (confirm('Reset demo data ke default?')) {
                    resetDemoData();
                    window.location.reload();
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
              >
                Reset Demo
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left mr-1">
                  <p className="text-sm font-medium text-gray-700 leading-none">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setActiveTab('profile')} className="cursor-pointer">
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profil Saya
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="p-6 flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <Dashboard
                sales={sales}
                products={products}
                salesmen={salesmen}
              />
            )}

            {activeTab === 'sales' && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Total Transaksi: <strong>{sales.length}</strong></span>
                  </div>
                  <button
                    onClick={() => setShowSalesModal(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Tambah Penjualan
                  </button>
                </div>
                <SalesHistory sales={sales} salesmen={salesmen} onAddSale={() => setShowSalesModal(true)} />
              </>
            )}

            {activeTab === 'products' && (
              <ProductList
                products={products}
                locations={locations}
                userRole={userRole}
                onAddProduct={() => setShowAddProductModal(true)}
                onEditProduct={handleEditProduct}
                onDeleteProduct={deleteProduct}
              />
            )}

            {activeTab === 'salesmen' && (
              <SalesmanList
                salesmen={salesmen}
                onAdd={addSalesman}
                onUpdate={updateSalesman}
                onDelete={deleteSalesman}
              />
            )}

            {activeTab === 'users' && userRole === 'admin' && (
              <ManageUsers authToken={authToken} />
            )}

            {activeTab === 'locations' && (
              <LocationManagement
                locations={locations}
                onAdd={addLocation}
                onUpdate={updateLocation}
                onDelete={deleteLocation}
              />
            )}

            {activeTab === 'customers' && (
              <CustomerManagement
                customers={customers}
                onAdd={addCustomer}
                onUpdate={updateCustomer}
                onDelete={deleteCustomer}
              />
            )}

            {activeTab === 'profile' && user && (
              <UserProfile user={user} userRole={userRole} authToken={authToken} />
            )}
          </div>
        </div>
      </main>

      <SalesEntryModal
        isOpen={showSalesModal}
        onClose={() => setShowSalesModal(false)}
        products={products}
        salesmen={salesmen}
        customers={customers}
        onSaleSubmit={addSale}
      />

      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => {
          setShowAddProductModal(false);
          setEditingProduct(undefined);
        }}
        onSubmit={editingProduct ? handleUpdateProductWrapper : addProduct}
        locations={locations}
        editProduct={editingProduct}
      />
    </div>
  );
}
