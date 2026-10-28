import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, Plus, User as UserIcon, LogOut, Briefcase, Menu, X, Download } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: 'discover' | 'categories' | 'for-businesses' | 'my-portfolios') => void;
  activeView: string;
  onOpenCreate: () => void;
  onDownloadZip?: () => void;
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  activeView,
  onOpenCreate,
  onDownloadZip,
}) => {
  const { user, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080F0B]/90 backdrop-blur-md border-b border-[#16291E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('discover');
          }}
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#F0F5F2] hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 group"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-900 transition-colors">
            <Leaf className="w-4 h-4 fill-emerald-500/30 text-emerald-400" />
          </span>
          <span>Hublivo</span>
        </a>

        {/* Zone 2: Navigation Links (single-line, clean text with hover underlines) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#9BB1A4]">
          <button
            onClick={() => onNavigate('discover')}
            className={`whitespace-nowrap shrink-0 hover:text-[#E8F2EC] transition-colors py-1 ${
              activeView === 'discover' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => onNavigate('categories')}
            className={`whitespace-nowrap shrink-0 hover:text-[#E8F2EC] transition-colors py-1 ${
              activeView === 'categories' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => onNavigate('for-businesses')}
            className={`whitespace-nowrap shrink-0 hover:text-[#E8F2EC] transition-colors py-1 ${
              activeView === 'for-businesses' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            For Businesses
          </button>
          {user && (
            <button
              onClick={() => onNavigate('my-portfolios')}
              className={`whitespace-nowrap shrink-0 hover:text-[#E8F2EC] transition-colors py-1 flex items-center gap-1.5 ${
                activeView === 'my-portfolios' ? 'text-emerald-400 font-semibold' : ''
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>My Portfolios</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action & Auth */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenCreate}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Portfolio</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-[#0E1C14] hover:bg-[#162A1F] border border-[#1A3324] text-xs font-medium text-[#E0EBE4] transition-colors whitespace-nowrap shrink-0"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 flex items-center justify-center font-bold text-[11px]">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0D1912] border border-[#1F3928] rounded-xl shadow-xl py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-[#1A3324] text-[#7E9688]">
                      Signed in as <strong className="text-[#E0EBE4] block truncate">{user.email}</strong>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('my-portfolios');
                      }}
                      className="w-full text-left px-3.5 py-2 text-[#C4D9CC] hover:bg-[#152B1E] flex items-center gap-2 transition-colors"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Manage Portfolios</span>
                    </button>
                    {onDownloadZip && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onDownloadZip();
                        }}
                        className="w-full text-left px-3.5 py-2 text-emerald-300 hover:bg-[#152B1E] flex items-center gap-2 transition-colors border-t border-[#1A3324]"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Download Code (.zip)</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-red-300 hover:bg-red-950/40 flex items-center gap-2 transition-colors border-t border-[#1A3324]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-2 text-xs font-medium text-[#C2D6CA] hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger button */}
        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <button
              onClick={onOpenCreate}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg"
            >
              + Create
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-3 py-1.5 text-xs font-medium text-emerald-300 bg-[#122419] rounded-lg border border-[#1C3626]"
            >
              Log In
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#8EA396] hover:text-white rounded-lg bg-[#0E1A13] border border-[#1A3324]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#16291E] bg-[#09130D] px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              onNavigate('discover');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-[#C4D9CC] hover:bg-[#122419]"
          >
            Discover
          </button>
          <button
            onClick={() => {
              onNavigate('categories');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-[#C4D9CC] hover:bg-[#122419]"
          >
            Categories
          </button>
          <button
            onClick={() => {
              onNavigate('for-businesses');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-[#C4D9CC] hover:bg-[#122419]"
          >
            For Businesses
          </button>
          {user ? (
            <>
              <button
                onClick={() => {
                  onNavigate('my-portfolios');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm text-emerald-300 hover:bg-[#122419] flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>My Portfolios</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm text-red-300 hover:bg-red-950/30 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-[#16291E] flex gap-2">
              <button
                onClick={() => {
                  openAuthModal('login');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-[#14291C] text-[#C4D9CC]"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  openAuthModal('register');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-emerald-600 text-white"
              >
                Sign Up
              </button>
            </div>
          )}

          {onDownloadZip && (
            <button
              onClick={() => {
                onDownloadZip();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-[#122419] flex items-center gap-2 border-t border-[#16291E] mt-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Code (.zip)</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
