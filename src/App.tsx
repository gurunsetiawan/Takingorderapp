import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useData } from './hooks/useData';
import { Dashboard } from './components/Dashboard';
import { DashboardHeader } from './components/DashboardHeader';
import { NavigationSidebar } from './components/NavigationSidebar';
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
import { API_URL, IS_DEMO } from './utils/api';
import { useIsMobile } from './components/ui/use-mobile';
import { resetDemoData } from './demo/mockApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { User, Product, Sale, Customer, Salesman, Location } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sales' | 'products' | 'salesmen' | 'users' | 'locations' | 'customers' | 'profile'>('dashboard');
  const { user, userRole, authToken, loading: authLoading, login, signup, logout, refreshSession } = useAuth();

  const {
    products, sales, salesmen, locations, customers,
    loading: dataLoading, error,
    loadData, clearData,
    addSale,
    addSalesman, updateSalesman, deleteSalesman,
    addProduct, updateProduct, deleteProduct,
    addLocation, updateLocation, deleteLocation,
    addCustomer, updateCustomer, deleteCustomer
  } = useData(authToken);

  const loading = authLoading || dataLoading;
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

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
  }, [activeTab, userRole, user]);

  useEffect(() => {
    if (!user) {
      clearData();
    }
  }, [user, clearData]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddProductModal(true);
  };

  const pageTitle =
    activeTab === 'dashboard' ? 'Dashboard' :
      activeTab === 'sales' ? 'Penjualan' :
        activeTab === 'products' ? 'Daftar Produk' :
          activeTab === 'salesmen' ? 'Daftar Salesman' :
            activeTab === 'users' ? 'Manajemen User' :
              activeTab === 'locations' ? 'Manajemen Lokasi' :
                activeTab === 'customers' ? 'Customer' :
                  activeTab === 'profile' ? 'Profil Pengguna' :
                    'Taking Order System';

  const showSidebarLabels = isMobile || !sidebarCollapsed;
  const sidebarWidth = isMobile ? 260 : (sidebarCollapsed ? 56 : 240);

  const goToTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (isMobile) closeMobileSidebar();
  };

  // Show login screen if not authenticated
  if (!user) {
    return <Login onLogin={login} onSignup={signup} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <NavigationSidebar
        isMobile={isMobile}
        sidebarOpenMobile={sidebarOpenMobile}
        sidebarCollapsed={sidebarCollapsed}
        sidebarWidth={sidebarWidth}
        userRole={userRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCloseMobile={closeMobileSidebar}
        onLogout={logout}
      />

      <div className="flex-1">
        <DashboardHeader
          user={user}
          userRole={userRole}
          pageTitle={pageTitle}
          toggleSidebar={toggleSidebar}
          showDemoReset={showDemoReset}
          onResetDemo={() => {
            if (!confirm('Reset data demo? Semua data akan kembali ke seed awal.')) return;
            resetDemoData();
            window.location.reload();
          }}
          onLogout={() => {
            logout();
            closeMobileSidebar();
          }}
          onProfileClick={() => goToTab('profile')}
        />

        <main className="px-4 py-6">
          <div className="mx-auto w-full max-w-6xl">
            {activeTab === 'dashboard' && (
              <Dashboard sales={sales} products={products} salesmen={salesmen} />
            )}
            {activeTab === 'sales' && (
              <SalesHistory
                sales={sales}
                salesmen={salesmen}
                onAddSale={() => setShowSalesModal(true)}
              />
            )}
            {activeTab === 'products' && (
              <ProductList
                products={products}
                locations={locations}
                onAddProduct={() => setShowAddProductModal(true)}
                onEditProduct={handleEditProduct}
                onDeleteProduct={deleteProduct}
              />
            )}
            {activeTab === 'salesmen' && userRole === 'admin' && (
              <SalesmanList
                salesmen={salesmen}
                onAdd={addSalesman}
                onUpdate={updateSalesman}
                onDelete={deleteSalesman}
              />
            )}
            {activeTab === 'users' && userRole === 'admin' && (
              <ManageUsers onUserUpdated={refreshSession} authToken={authToken} />
            )}
            {activeTab === 'locations' && userRole === 'admin' && (
              <LocationManagement
                locations={locations}
                onAdd={addLocation}
                onUpdate={updateLocation}
                onDelete={deleteLocation}
              />
            )}
            {activeTab === 'customers' && userRole === 'admin' && (
              <CustomerManagement
                customers={customers}
                onAdd={addCustomer}
                onUpdate={updateCustomer}
                onDelete={deleteCustomer}
              />
            )}
            {activeTab === 'profile' && (
              <UserProfile user={user} userRole={userRole} authToken={authToken} onUpdate={refreshSession} />
            )}
          </div>
        </main>

        {showSalesModal && (
          <SalesEntryModal
            products={products}
            salesmen={salesmen}
            customers={customers}
            onSaleSubmit={addSale}
            onClose={() => setShowSalesModal(false)}
          />
        )}

        {showAddProductModal && (
          <AddProductModal
            onSubmit={(data) => editingProduct ? updateProduct(editingProduct.id, data) : addProduct(data)}
            editProduct={editingProduct}
            locations={locations}
            onClose={() => setShowAddProductModal(false)}
          />
        )}
      </div>
    </div>
  );
}
