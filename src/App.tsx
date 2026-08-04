import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Category, Product, Order, SiteSettings, Subscriber } from './types';

// Public Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryQuickNav } from './components/CategoryQuickNav';
import { MarqueeBanner } from './components/MarqueeBanner';
import { ProductGrid } from './components/ProductGrid';
import { SaleBanner } from './components/SaleBanner';
import { FeatureBlocks } from './components/FeatureBlocks';
import { Testimonials } from './components/Testimonials';
import { TiltedBeigeBand } from './components/TiltedBeigeBand';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SearchModal } from './components/SearchModal';
import { OfferPopupModal } from './components/OfferPopupModal';
import { BottomNavbar } from './components/BottomNavbar';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { LiveChatWidget } from './components/LiveChatWidget';

// Admin Components
import { AdminLogin } from './components/Admin/AdminLogin';
import { AdminLayout } from './components/Admin/AdminLayout';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminProducts } from './components/Admin/AdminProducts';
import { AdminCategories } from './components/Admin/AdminCategories';
import { AdminOrders } from './components/Admin/AdminOrders';
import { AdminSettings } from './components/Admin/AdminSettings';
import { AdminSubscribers } from './components/Admin/AdminSubscribers';
import { AdminUsers } from './components/Admin/AdminUsers';
import { AdminTestimonials } from './components/Admin/AdminTestimonials';
import { AdminLiveChat } from './components/Admin/AdminLiveChat';

function MainStoreContent() {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);

  // Admin View State
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
  });
  const [adminTab, setAdminTab] = useState<any>('dashboard');

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
    const safeFetch = async (url: string) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        console.error(`Error fetching ${url}:`, e);
        return null;
      }
    };

    try {
      const [catRes, prodRes, setRes, ordRes, subRes] = await Promise.all([
        safeFetch('/api/categories'),
        safeFetch('/api/products'),
        safeFetch('/api/settings'),
        safeFetch('/api/orders'),
        safeFetch('/api/subscribers'),
      ]);

      if (Array.isArray(catRes)) setCategories(catRes);
      if (Array.isArray(prodRes)) setProducts(prodRes);
      if (setRes && typeof setRes === 'object' && !setRes.error) setSettings(setRes);
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

  // Dynamic Favicon effect
  useEffect(() => {
    if (settings.site_logo_url) {
      let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.site_logo_url;
    }
  }, [settings.site_logo_url]);

  const handleSelectCategoryAndScroll = (slug: string | null) => {
    setActiveCategorySlug(slug);
    const el = document.getElementById('newest-products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
        {adminTab === 'chat' && <AdminLiveChat />}
        {adminTab === 'testimonials' && <AdminTestimonials />}
        {adminTab === 'settings' && <AdminSettings settings={settings} onRefresh={fetchData} />}
        {adminTab === 'subscribers' && <AdminSubscribers subscribers={subscribers} />}
        {adminTab === 'admin-users' && <AdminUsers onRefresh={fetchData} />}
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
    <div className={`min-h-screen font-sans pb-16 md:pb-0 transition-colors ${
      isDark ? 'bg-black text-white selection:bg-white selection:text-black' : 'bg-stone-50 text-zinc-900 selection:bg-black selection:text-white'
    }`}>
      {/* Header Navigation */}
      <Navbar
        categories={categories}
        settings={settings}
        activeCategory={activeCategorySlug}
        onSelectCategory={handleSelectCategoryAndScroll}
        onOpenAdmin={handleOpenAdmin}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
      />

      {/* Hero Section */}
      <Hero
        settings={settings}
        categories={categories}
        onSelectCategory={handleSelectCategoryAndScroll}
        onExploreClick={() => handleSelectCategoryAndScroll(null)}
      />

      {/* Category Quick Nav Index */}
      <CategoryQuickNav
        categories={categories}
        onSelectCategory={handleSelectCategoryAndScroll}
      />

      {/* Ticker Marquee */}
      <MarqueeBanner settings={settings} />

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

      {/* Customer Testimonials Section */}
      <Testimonials />

      {/* Tilted Beige Band with perspective distortion */}
      <TiltedBeigeBand />

      {/* Newsletter Signup */}
      <Newsletter settings={settings} />

      {/* Editorial Footer */}
      <Footer
        categories={categories}
        settings={settings}
        onSelectCategory={setActiveCategorySlug}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Bottom Sticky Mobile Navigation Bar */}
      <BottomNavbar
        onHomeClick={() => {
          setActiveCategorySlug(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onCollectionsClick={() => {
          const el = document.getElementById('newest-products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
      />

      {/* Floating Customer Live Chat Widget */}
      <LiveChatWidget />

      {/* Modals & Drawers */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        settings={settings}
      />
      <OfferPopupModal
        settings={settings}
        onExploreClick={() => {
          const el = document.getElementById('newest-products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
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
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MainStoreContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
