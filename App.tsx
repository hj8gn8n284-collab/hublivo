import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Business, CATEGORIES, Category } from './types/business';
import { INITIAL_BUSINESSES } from './data/initialBusinesses';
import { fetchBusinesses, fetchBusinessById } from './services/api';
import { Navbar } from './components/Navbar';
import { BusinessCard } from './components/BusinessCard';
import { PortfolioEditorModal } from './components/PortfolioEditorModal';
import { PublicPortfolioView } from './components/PublicPortfolioView';
import { MyPortfoliosView } from './components/MyPortfoliosView';
import { ForBusinessesView } from './components/ForBusinessesView';
import { AuthModal } from './components/AuthModal';
import { 
  Search, MapPin, SlidersHorizontal, Sparkles, AlertCircle, 
  Leaf, ArrowRight, CheckCircle2, RefreshCw, X
} from 'lucide-react';

function HublivoApp() {
  const { user, openAuthModal } = useAuth();

  // Navigation & View State
  const [activeView, setActiveView] = useState<'discover' | 'categories' | 'for-businesses' | 'my-portfolios'>('discover');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // Editor Modal State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  // Live Preview State (from inside editor)
  const [previewBusiness, setPreviewBusiness] = useState<Partial<Business> | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Data State initialized with instant offline fallback
  const [businesses, setBusinesses] = useState<Business[]>(INITIAL_BUSINESSES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      showToast('Creating .zip archive...');
      const res = await fetch('/api/download.zip');
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'hublivo-fullstack-app.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
      showToast('Download started! Check Safari downloads.');
    } catch (err: any) {
      console.error(err);
      // Fallback
      window.location.href = '/api/download.zip';
    } finally {
      setDownloadingZip(false);
    }
  };

  // Sync hash routing for shareable URLs
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('portfolio/')) {
        const idOrSlug = hash.replace('portfolio/', '');
        try {
          const biz = await fetchBusinessById(idOrSlug);
          setSelectedBusiness(biz);
        } catch (e) {
          console.error(e);
        }
      } else if (hash === 'for-businesses') {
        setSelectedBusiness(null);
        setActiveView('for-businesses');
      } else if (hash === 'categories') {
        setSelectedBusiness(null);
        setActiveView('categories');
      } else if (hash === 'my-portfolios') {
        setSelectedBusiness(null);
        setActiveView('my-portfolios');
      } else if (!hash) {
        setSelectedBusiness(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch businesses whenever query/category/location changes
  const loadBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBusinesses({
        search: searchQuery.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        location: locationQuery.trim() || undefined,
      });
      setBusinesses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load business profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBusinesses();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setSelectedCategory('All');
  };

  const handleViewBusiness = (biz: Business) => {
    window.location.hash = `portfolio/${biz.slug || biz.id}`;
    setSelectedBusiness(biz);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDiscover = () => {
    window.location.hash = '';
    setSelectedBusiness(null);
    setPreviewBusiness(null);
    setActiveView('discover');
  };

  const handleOpenCreate = () => {
    if (!user) {
      openAuthModal('register');
      return;
    }
    setEditingBusiness(null);
    setEditorOpen(true);
  };

  const handleEditBusiness = (biz: Business) => {
    setEditingBusiness(biz);
    setEditorOpen(true);
  };

  const handleSavedBusiness = (saved: Business) => {
    setEditorOpen(false);
    setEditingBusiness(null);
    setPreviewBusiness(null);
    showToast(
      saved.status === 'published'
        ? `"${saved.name}" is now live and published!`
        : `"${saved.name}" draft saved successfully.`
    );
    loadBusinesses();
    handleViewBusiness(saved);
  };

  // Segregate Featured vs Recent
  const featuredBusinesses = businesses.filter(b => b.featured);
  const recentBusinesses = businesses.filter(b => !b.featured);

  return (
    <div className="min-h-screen bg-[#080F0B] text-[#F0F5F2] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-950 border border-emerald-600/70 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        onNavigate={(view) => {
          setSelectedBusiness(null);
          setPreviewBusiness(null);
          setActiveView(view);
          if (view === 'discover') window.location.hash = '';
          else window.location.hash = view;
        }}
        activeView={activeView}
        onOpenCreate={handleOpenCreate}
        onDownloadZip={handleDownloadZip}
      />

      {/* If Live Preview from inside Editor */}
      {previewBusiness ? (
        <div className="relative">
          <div className="bg-amber-950/90 border-b border-amber-800 text-amber-200 py-2.5 px-4 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Preview Mode: This is how potential clients will view your public portfolio.</span>
            </div>
            <button
              onClick={() => setPreviewBusiness(null)}
              className="px-3 py-1 bg-amber-900/60 hover:bg-amber-800 rounded-lg text-white text-xs transition-colors"
            >
              Exit Preview & Return to Editor
            </button>
          </div>
          <PublicPortfolioView
            business={previewBusiness as Business}
            onBack={() => setPreviewBusiness(null)}
          />
        </div>
      ) : selectedBusiness ? (
        /* PUBLIC SHAREABLE PORTFOLIO VIEW */
        <PublicPortfolioView
          business={selectedBusiness}
          onBack={handleBackToDiscover}
          onEdit={() => {
            setEditingBusiness(selectedBusiness);
            setEditorOpen(true);
          }}
        />
      ) : activeView === 'my-portfolios' ? (
        /* MY PORTFOLIOS (OWNER DASHBOARD) */
        <MyPortfoliosView
          onBack={handleBackToDiscover}
          onEdit={handleEditBusiness}
          onView={handleViewBusiness}
          onCreateNew={handleOpenCreate}
        />
      ) : activeView === 'for-businesses' ? (
        /* FOR BUSINESSES EXPLAINER */
        <ForBusinessesView
          onStartCreating={handleOpenCreate}
          onBackToDiscover={handleBackToDiscover}
        />
      ) : (
        /* HOMEPAGE & DISCOVERY VIEW */
        <main className="flex-1 pb-20">
          {/* SEARCH BAR NEAR THE TOP (Hero decision anchor) */}
          <section className="relative px-4 sm:px-6 lg:px-8 pt-10 pb-12 border-b border-[#14261B] bg-gradient-to-b from-[#0B150F] to-[#080F0B]">
            <div className="max-w-4xl mx-auto text-center space-y-4 mb-8">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wide uppercase">
                <span>Independent Business Discovery</span>
                <span className="text-[#3F5448]">·</span>
                <span>Direct Pricing & Availability</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F0F5F2] leading-tight text-balance">
                Discover independent businesses and craftsman portfolios.
              </h1>
              <p className="text-sm sm:text-base text-[#95ADA0] max-w-2xl mx-auto leading-relaxed">
                Explore local woodworkers, landscapers, artisan bakers, wellness specialists, and mobile services. Clear prices with zero middleman markups.
              </p>
            </div>

            {/* Comprehensive Search Bar Container */}
            <div className="max-w-3xl mx-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="p-2 sm:p-2.5 rounded-2xl bg-[#0E1B13] border border-[#1E3B27] shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                {/* Search input: Name, Service, or Category */}
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5">
                  <Search className="w-4 h-4 text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by business name, service (e.g. sourdough, detailing)..."
                    className="w-full bg-transparent text-sm text-[#F0F5F2] placeholder-[#577061] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-[#647F6E] hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="hidden sm:block h-7 w-[1px] bg-[#1E3B27]" />

                {/* Location Search Input */}
                <div className="sm:w-60 flex items-center gap-2 px-3 py-1.5 border-t sm:border-t-0 border-[#1B3624]">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="City or state..."
                    className="w-full bg-transparent text-sm text-[#F0F5F2] placeholder-[#577061] focus:outline-none"
                  />
                  {locationQuery && (
                    <button
                      type="button"
                      onClick={() => setLocationQuery('')}
                      className="text-[#647F6E] hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </form>
            </div>

            {/* Category Filter Tabs (Clean Segmented Control) */}
            <div className="max-w-5xl mx-auto mt-8">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      selectedCategory === cat
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-[#0E1C14] border border-[#1A3323] text-[#93ABA0] hover:text-[#E0EBE4] hover:bg-[#14291D]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* BUSINESSES LISTINGS SECTION */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
            {/* Active Filters Summary if searching */}
            {(searchQuery || locationQuery || selectedCategory !== 'All') && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D1812] border border-[#193322] text-xs">
                <div className="flex items-center gap-2 text-[#9EB3A5]">
                  <span>Filtering by:</span>
                  {selectedCategory !== 'All' && (
                    <strong className="text-emerald-300">{selectedCategory}</strong>
                  )}
                  {searchQuery && (
                    <>
                      <span className="text-[#3E5245]">·</span>
                      <span>Keyword "{searchQuery}"</span>
                    </>
                  )}
                  {locationQuery && (
                    <>
                      <span className="text-[#3E5245]">·</span>
                      <span>Location "{locationQuery}"</span>
                    </>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="py-24 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#8BA494]">Finding verified business portfolios...</p>
              </div>
            ) : error ? (
              /* Error State */
              <div className="p-8 rounded-2xl bg-red-950/40 border border-red-900 text-center space-y-3 max-w-lg mx-auto">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                <h3 className="text-base font-bold text-red-200">Could not load businesses</h3>
                <p className="text-xs text-red-300/80">{error}</p>
                <button
                  onClick={loadBusinesses}
                  className="px-4 py-2 rounded-lg bg-red-900 hover:bg-red-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : businesses.length === 0 ? (
              /* Empty State */
              <div className="py-20 text-center space-y-4 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-[#0D1B13] border border-[#1B3624] text-emerald-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#F0F5F2]">No businesses match your search</h3>
                <p className="text-xs text-[#8BA494] leading-relaxed">
                  Try adjusting your search terms or resetting the category filter to explore all verified profiles.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  View All Businesses
                </button>
              </div>
            ) : (
              <>
                {/* FEATURED BUSINESSES SECTION */}
                {featuredBusinesses.length > 0 && selectedCategory === 'All' && !searchQuery && !locationQuery && (
                  <section className="space-y-5">
                    <div className="flex items-center justify-between border-b border-[#14261B] pb-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Curated Excellence</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-[#F0F5F2]">
                          Featured Portfolios
                        </h2>
                      </div>
                      <span className="text-xs text-[#7A9485] font-medium hidden sm:inline">
                        Verified independent craftspeople
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                      {featuredBusinesses.map(biz => (
                        <BusinessCard
                          key={biz.id}
                          business={biz}
                          onView={handleViewBusiness}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* RECENTLY ADDED OR ALL BUSINESSES */}
                <section className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#14261B] pb-3">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-[#F0F5F2]">
                        {selectedCategory !== 'All' 
                          ? `${selectedCategory} (${businesses.length})`
                          : searchQuery || locationQuery 
                          ? `Search Results (${businesses.length})` 
                          : 'Recently Added Portfolios'}
                      </h2>
                      <p className="text-xs text-[#8EA395] mt-1">
                        Browse active service providers with up-to-date hours and pricing.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                    {(selectedCategory !== 'All' || searchQuery || locationQuery ? businesses : recentBusinesses.length > 0 ? recentBusinesses : businesses).map(biz => (
                      <BusinessCard
                        key={biz.id}
                        business={biz}
                        onView={handleViewBusiness}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* CALL TO ACTION CARD FOR NEW BUSINESSES */}
            <div className="mt-14 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0D1D14] to-[#07100A] border border-[#193825] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Are you a business owner or craftsman?</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#F0F5F2]">
                  Create your portfolio in 5 minutes
                </h3>
                <p className="text-xs sm:text-sm text-[#9BB3A5] max-w-xl">
                  Simple form, zero tech skills required. Put your photos, prices, and service hours in front of customers today.
                </p>
              </div>

              <button
                onClick={handleOpenCreate}
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-lg shadow-emerald-950/50 flex items-center gap-2 shrink-0"
              >
                <span>Create My Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      )}

      {/* FOOTER (Quiet, clean typography, anti-slop) */}
      <footer className="border-t border-[#132419] bg-[#070D09] py-10 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#758E80]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-950 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <Leaf className="w-3.5 h-3.5 fill-emerald-500/30" />
            </span>
            <span className="font-bold text-[#E0EBE4] tracking-tight text-sm">Hublivo</span>
            <span className="text-[#3C5043]">·</span>
            <span>Independent Business Discovery Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setSelectedBusiness(null);
                setPreviewBusiness(null);
                setActiveView('discover');
                window.location.hash = '';
              }}
              className="hover:text-emerald-300 transition-colors"
            >
              Discover
            </button>
            <button
              onClick={() => {
                setSelectedBusiness(null);
                setPreviewBusiness(null);
                setActiveView('for-businesses');
                window.location.hash = 'for-businesses';
              }}
              className="hover:text-emerald-300 transition-colors"
            >
              For Businesses
            </button>
            <button
              onClick={handleOpenCreate}
              className="hover:text-emerald-300 transition-colors"
            >
              List Your Business
            </button>
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Download project as .zip file"
            >
              <span>{downloadingZip ? 'Preparing .zip...' : 'Download Code (.zip)'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* PORTFOLIO CREATION / EDITING MODAL */}
      {editorOpen && (
        <PortfolioEditorModal
          business={editingBusiness}
          onClose={() => {
            setEditorOpen(false);
            setEditingBusiness(null);
          }}
          onSaved={handleSavedBusiness}
          onPreview={(previewPayload) => {
            setPreviewBusiness(previewPayload);
            setEditorOpen(false);
          }}
        />
      )}

      {/* AUTH MODAL */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HublivoApp />
    </AuthProvider>
  );
}
