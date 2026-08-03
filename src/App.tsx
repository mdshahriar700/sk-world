import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Category, Product, Order, SiteSettings, Subscriber } from './types';

// Public Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryQuickNav } from './components/CategoryQuickNav';
import { MarqueeBanner } from './components/MarqueeBanner';
import { ProductGrid } from './components/ProductGrid';
import { SaleBanner } from './components/SaleBanner';
import { FeatureBlocks } from './components/FeatureBlocks';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SearchModal } from './components/SearchModal';

// Admin Components
import { AdminLogin } from './components/Admin/AdminLogin';
import { AdminLayout } from './components/Admin/AdminLayout';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminProducts } from './components/Admin/AdminProducts';
import { AdminCategories } from './components/Admin/AdminCategories';
import { AdminOrders } from './components/Admin/AdminOrders';
import { AdminSettings } from './components/Admin/AdminSettings';
import { AdminSubscribers } from './components/Admin/AdminSubscribers';

function MainStoreContent() {
  const { isAuthenticated } = useAuth();

  // Store State
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  // Navigation & UI State
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Admin View State
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
  });
  const [adminTab, setAdminTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'settings' | 'subscribers'>('dashboard');

  const [loading, setLoading] = useState(true);

  // Sync URL popstate & path changes
  useEffect(() => {
    const handleLocationCheck = () => {
      const isPathAdmin = window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
      setIsAdminView(isPathAdmin);
    };

    window.addEventListener('popstate', handleLocationCheck);
    return () => window.removeEventListener('popstate', handleLocationCheck);
  }, []);

  const handleExitAdmin = () => {
    if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
      window.history.pushState({}, '', '/');
    }
    setIsAdminView(false);
  };

  // Fetch Store Data
  const fetchData = async () => {
    try {
      const [catRes, prodRes, setRes, ordRes, subRes] = await Promise.all([
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/subscribers').then((r) => r.json()),
      ]);

      if (Array.isArray(catRes)) setCategories(catRes);
      if (Array.isArray(prodRes)) setProducts(prodRes);
      if (typeof setRes === 'object' && !setRes.error) setSettings(setRes);
      if (Array.isArray(ordRes)) setOrders(ordRes);
      if (Array.isArray(subRes)) setSubscribers(subRes);
    } catch (err) {
      console.error('Failed to load store data from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const trendingProducts = products.filter((p) => p.is_trending);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="w-12 h-12 bg-white text-black font-extrabold text-2xl flex items-center justify-center animate-pulse border border-white">
          SK
        </div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">
          INITIALIZING SK WORL MILANO ENGINE...
        </span>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ADMIN PANEL VIEW (/admin)
  // -------------------------------------------------------------
  if (isAdminView) {
    if (!isAuthenticated) {
      return (
        <AdminLogin
          onSuccess={() => setIsAdminView(true)}
          onCancel={handleExitAdmin}
        />
      );
    }

    return (
      <AdminLayout
        activeTab={adminTab}
        setActiveTab={setAdminTab}
        onExitAdmin={handleExitAdmin}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            products={products}
            orders={orders}
            subscribers={subscribers}
            onNavigateTab={(tab: any) => setAdminTab(tab)}
          />
        )}
        {adminTab === 'products' && (
          <AdminProducts products={products} categories={categories} onRefresh={fetchData} />
        )}
        {adminTab === 'categories' && (
          <AdminCategories categories={categories} onRefresh={fetchData} />
        )}
        {adminTab === 'orders' && <AdminOrders orders={orders} onRefresh={fetchData} />}
        {adminTab === 'settings' && <AdminSettings settings={settings} onRefresh={fetchData} />}
        {adminTab === 'subscribers' && <AdminSubscribers subscribers={subscribers} />}
      </AdminLayout>
    );
  }

  const handleOpenAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminView(true);
  };

  // -------------------------------------------------------------
  // PUBLIC STOREFRONT VIEW
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Header Navigation */}
      <Navbar
        categories={categories}
        settings={settings}
        activeCategory={activeCategorySlug}
        onSelectCategory={setActiveCategorySlug}
        onOpenAdmin={handleOpenAdmin}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Hero Section */}
      <Hero
        settings={settings}
        onExploreClick={() => {
          setActiveCategorySlug(null);
          const el = document.getElementById('newest-products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Category Quick Nav Index */}
      <CategoryQuickNav
        categories={categories}
        onSelectCategory={(slug) => {
          setActiveCategorySlug(slug);
          const el = document.getElementById('newest-products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Ticker Marquee */}
      <MarqueeBanner />

      {/* Newest Products Section */}
      <div id="newest-products-section">
        <ProductGrid
          title="NEWEST PRODUCTS"
          subtitle="EXPLORE THE LATEST DROPS CRAFTED WITH UNCOMPROMISING PRECISION IN MILANO."
          products={products}
          categories={categories}
          selectedCategorySlug={activeCategorySlug}
          onSelectCategory={setActiveCategorySlug}
          onQuickView={setQuickViewProduct}
        />
      </div>

      {/* Sale Banner */}
      <SaleBanner
        settings={settings}
        onExploreClick={() => {
          const el = document.getElementById('newest-products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Trending Collections Grid */}
      {trendingProducts.length > 0 && (
        <ProductGrid
          title="TRENDING SELECTION"
          subtitle="MOST WANTED ICONIC STREETWEAR SILHOUETTES OF THE SEASON."
          products={trendingProducts}
          categories={categories}
          selectedCategorySlug={null}
          onSelectCategory={() => {}}
          onQuickView={setQuickViewProduct}
        />
      )}

      {/* Editable Feature Blocks */}
      <FeatureBlocks
        settings={settings}
        onExploreClick={() => {
          const el = document.getElementById('newest-products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Newsletter Signup */}
      <Newsletter settings={settings} />

      {/* Editorial Footer */}
      <Footer
        categories={categories}
        settings={settings}
        onSelectCategory={setActiveCategorySlug}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={setQuickViewProduct}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainStoreContent />
      </CartProvider>
    </AuthProvider>
  );
}
