import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Shield,
    MapPin,
    Building2,
    UserCircle,
    LogOut
} from 'lucide-react';

interface NavigationSidebarProps {
    isMobile: boolean;
    sidebarOpenMobile: boolean;
    sidebarCollapsed: boolean;
    sidebarWidth: number;
    userRole: 'admin' | 'user';
    activeTab: string;
    onTabChange: (tab: any) => void;
    onCloseMobile: () => void;
    onLogout: () => void;
}

export function NavigationSidebar({
    isMobile,
    sidebarOpenMobile,
    sidebarCollapsed,
    sidebarWidth,
    userRole,
    activeTab,
    onTabChange,
    onCloseMobile,
    onLogout
}: NavigationSidebarProps) {
    const showSidebarLabels = isMobile || !sidebarCollapsed;

    const goToTab = (tab: string) => {
        onTabChange(tab);
        if (isMobile) onCloseMobile();
    };

    return (
        <>
            {isMobile && sidebarOpenMobile && (
                <div
                    onClick={onCloseMobile}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        zIndex: 10,
                    }}
                />
            )}

            <aside
                className="bg-white shadow-md"
                style={{
                    position: isMobile ? 'fixed' : 'relative',
                    top: isMobile ? 0 : undefined,
                    bottom: isMobile ? 0 : undefined,
                    left: isMobile ? 0 : undefined,
                    width: sidebarWidth,
                    minHeight: isMobile ? undefined : '100vh',
                    transform: isMobile ? `translateX(${sidebarOpenMobile ? 0 : -sidebarWidth}px)` : undefined,
                    transition: isMobile ? 'transform 200ms ease' : 'width 200ms ease',
                    zIndex: isMobile ? 20 : undefined,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div className="px-4 py-4 border-b flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                    {showSidebarLabels && (
                        <div>
                            <p className="text-sm">Taking Order</p>
                            <p className="text-xs text-gray-500">Sales System</p>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-3">
                    <button
                        onClick={() => goToTab('dashboard')}
                        className={`w-full flex items-center ${showSidebarLabels ? 'gap-3' : 'justify-center'} px-3 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        {showSidebarLabels && <span>Dashboard</span>}
                    </button>

                    <button
                        onClick={() => goToTab('sales')}
                        className={`w-full flex items-center ${showSidebarLabels ? 'gap-3' : 'justify-center'} px-3 py-2 rounded-lg transition-colors ${activeTab === 'sales' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {showSidebarLabels && <span>Penjualan</span>}
                    </button>

                    <button
                        onClick={() => goToTab('products')}
                        className={`w-full flex items-center ${showSidebarLabels ? 'gap-3' : 'justify-center'} px-3 py-2 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <Package className="w-5 h-5" />
                        {showSidebarLabels && <span>Produk</span>}
                    </button>

                    {userRole === 'admin' && (
                        <>
                            <div className="border-t mt-4 mb-4" />

                            <button
                                onClick={() => goToTab('salesmen')}
                                className={`w-full flex items-center ${showSidebarLabels ? 'gap-3' : 'justify-center'} px-3 py-2 rounded-lg transition-colors ${activeTab === 'salesmen' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                                {showSidebarLabels && <span>Salesman</span>}
                            </button>

                            <button
                                onClick={() => goToTab('users')}
                                className={`w-full flex items-center ${showSidebarLabels ? 'gap-3' : 'justify-center'} px-3 py-2 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Shield className="w-5 h-5" />
                                {showSidebarLabels && <span>User</span>}
                            </button>

                            <button
                                onClick={() => goToTab('locations')}
                                className={`w-full flex items-center ${showSidebarLabels ? 'gap-3' : 'justify-center'} px-3 py-2 rounded-lg transition-colors ${activeTab === 'locations' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <MapPin className="w-5 h-5" />
                                {showSidebarLabels && <span>Lokasi</span>}
                            </button>

                            <button
                                onClick={() => goToTab('customers')}
                                className={`w-full flex items-center ${showSidebarLabels ? 'gap-3' : 'justify-center'} px-3 py-2 rounded-lg transition-colors ${activeTab === 'customers' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Building2 className="w-5 h-5" />
                                {showSidebarLabels && <span>Customer</span>}
                            </button>
                        </>
                    )}

                    <div className="border-t mt-4 mb-4" />

                    <button
                        onClick={() => goToTab('profile')}
                        className={`w-full flex items-center ${showSidebarLabels ? 'gap-3' : 'justify-center'} px-3 py-2 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <UserCircle className="w-5 h-5" />
                        {showSidebarLabels && <span>Profil</span>}
                    </button>
                </div>

                <div className="border-t px-2 py-3">
                    <button
                        onClick={() => {
                            onLogout();
                            if (isMobile) onCloseMobile();
                        }}
                        className={`w-full flex items-center ${showSidebarLabels ? 'gap-3' : 'justify-center'} px-3 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50`}
                    >
                        <LogOut className="w-5 h-5" />
                        {showSidebarLabels && <span>Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
