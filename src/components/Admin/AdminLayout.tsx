import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Sliders,
  Mail,
  UserCheck,
  LogOut,
  ArrowLeft,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  Store,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'subscribers'
  | 'admin-users'
  | 'settings';

interface AdminLayoutProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  setActiveTab,
  onExitAdmin,
  children,
}) => {
  const { logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: 'New' },
    { id: 'subscribers', label: 'Subscribers', icon: Mail },
    { id: 'admin-users', label: 'Admin Users', icon: UserCheck },
    { id: 'settings', label: 'Site Settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex font-sans antialiased">
      {/* ------------------------------------------------------------- */}
      {/* LEFT SIDEBAR (DESKTOP) */}
      {/* ------------------------------------------------------------- */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E5E7EB] sticky top-0 h-screen z-30 shrink-0">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/20">
              SK
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-[#111827]">SK WORLD</h1>
              <p className="text-[11px] font-medium text-[#64748B]">Admin Control Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-[#64748B] uppercase">
            Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#16A34A] text-white shadow-sm shadow-emerald-600/30'
                    : 'text-[#64748B] hover:bg-slate-100 hover:text-[#111827]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={17} className={isActive ? 'text-white' : 'text-[#64748B]'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live Store Quick Action Box */}
        <div className="p-3 mx-3 mb-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl">
          <div className="flex items-start space-x-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg mt-0.5">
              <Sparkles size={14} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950">Store Status: Live</h4>
              <p className="text-[11px] text-emerald-700 leading-tight mt-0.5">
                All Systems Running
              </p>
              <button
                onClick={onExitAdmin}
                className="mt-2 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 underline decoration-emerald-400"
              >
                <Store size={12} />
                <span>Visit Storefront &rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Footer Card */}
        <div className="p-3 border-t border-[#E5E7EB] bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-300">
                BS
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#111827] truncate">Badol SK</p>
                <p className="text-[10px] text-[#64748B] truncate">Super Admin</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onExitAdmin();
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE SIDEBAR OVERLAY */}
      {/* ------------------------------------------------------------- */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-full bg-white h-full flex flex-col shadow-2xl z-10">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-extrabold text-sm">
                  SK
                </div>
                <span className="font-bold text-sm text-[#111827]">SK WORLD ADMIN</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#16A34A] text-white'
                        : 'text-[#64748B] hover:bg-slate-100 hover:text-[#111827]'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-[#E5E7EB]">
              <button
                onClick={onExitAdmin}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
              >
                <ArrowLeft size={14} />
                <span>Return to Store</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTAINER */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar */}
            <div className="relative hidden sm:block w-72 lg:w-96">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, orders, customers..."
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2 text-xs text-[#111827] placeholder-[#64748B] focus:outline-none focus:border-[#16A34A] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            
            {/* Quick Add Product Button */}
            <button
              onClick={() => setActiveTab('products')}
              className="inline-flex items-center space-x-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Quick Add Product</span>
            </button>

            {/* Notification Bell */}
            <button
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Live Store Button */}
            <button
              onClick={onExitAdmin}
              className="hidden md:inline-flex items-center space-x-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
            >
              <Store size={14} />
              <span>Live Store</span>
            </button>

            {/* Profile Dropdown Badge */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#16A34A] font-bold text-xs flex items-center justify-center border border-emerald-200">
                BS
              </div>
              <span className="text-xs font-semibold text-[#111827] hidden sm:inline">Badol SK</span>
            </div>

          </div>
        </header>

        {/* MAIN BODY VIEW */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
