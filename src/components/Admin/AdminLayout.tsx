import React from 'react';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Sliders, Mail, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  activeTab: 'dashboard' | 'products' | 'categories' | 'orders' | 'settings' | 'subscribers';
  setActiveTab: (tab: any) => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ activeTab, setActiveTab, onExitAdmin, children }) => {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'settings', label: 'Site Settings', icon: Sliders },
    { id: 'subscribers', label: 'Subscribers', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Top Admin Navigation Header */}
      <header className="bg-zinc-950 border-b border-white/20 px-4 sm:px-8 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onExitAdmin}
              className="flex items-center space-x-1.5 font-mono text-xs uppercase text-zinc-300 hover:text-white bg-black px-3.5 py-2 border border-white/20 transition-colors font-bold"
            >
              <ArrowLeft size={14} />
              <span>LIVE STORE</span>
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-white text-black font-mono font-extrabold text-base flex items-center justify-center border border-white">
                SK
              </div>
              <div>
                <h1 className="font-black text-xl uppercase tracking-tighter font-syne text-white">SK WORL ADMIN</h1>
                <span className="text-[9px] font-mono text-zinc-400 block tracking-widest font-bold">STORES & INVENTORY CONTROL</span>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all border ${
                    isActive
                      ? 'bg-white text-black border-white font-extrabold shadow-md'
                      : 'bg-black text-zinc-400 border-white/10 hover:border-white hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => {
                logout();
                onExitAdmin();
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 font-mono text-xs font-bold uppercase bg-red-950 text-red-300 border border-red-800 hover:bg-red-900 transition-colors ml-2"
              title="Logout Admin"
            >
              <LogOut size={14} />
              <span className="hidden lg:inline">LOGOUT</span>
            </button>
          </nav>

        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {children}
      </main>
    </div>
  );
};
