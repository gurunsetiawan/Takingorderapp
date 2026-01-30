import { Menu, ChevronDown, UserCircle, Package, LogOut } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User } from '../types';

interface DashboardHeaderProps {
    user: User | null;
    userRole: 'admin' | 'user';
    pageTitle: string;
    toggleSidebar: () => void;
    showDemoReset: boolean;
    onResetDemo: () => void;
    onLogout: () => void;
    onProfileClick: () => void;
}

export function DashboardHeader({
    user,
    userRole,
    pageTitle,
    toggleSidebar,
    showDemoReset,
    onResetDemo,
    onLogout,
    onProfileClick
}: DashboardHeaderProps) {
    return (
        <header className="bg-white border-b shadow-sm sticky top-0 z-10">
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div>
                        <p className="text-sm text-gray-900">{pageTitle}</p>
                        <p className="text-xs text-gray-500">Sistem Pencatatan Penjualan Salesman</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors"
                            aria-label="User menu"
                            type="button"
                        >
                            <div className="text-right">
                                <p className="text-sm text-gray-900">{user?.name || user?.email}</p>
                                <p className="text-xs text-gray-500">{userRole === 'admin' ? 'Administrator' : 'User'}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[10rem]">
                        <DropdownMenuItem onSelect={onProfileClick}>
                            <UserCircle className="w-4 h-4" />
                            Profil
                        </DropdownMenuItem>
                        {showDemoReset && (
                            <DropdownMenuItem
                                onSelect={onResetDemo}
                            >
                                <Package className="w-4 h-4" />
                                Reset Demo Data
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={onLogout}
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
