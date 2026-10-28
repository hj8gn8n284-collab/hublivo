import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ArrowRight, ShieldCheck, Smartphone, DollarSign, Camera, Clock, Truck } from 'lucide-react';

interface ForBusinessesViewProps {
  onStartCreating: () => void;
  onBackToDiscover: () => void;
}

export const ForBusinessesView: React.FC<ForBusinessesViewProps> = ({
  onStartCreating,
  onBackToDiscover,
}) => {
  const { user, openAuthModal } = useAuth();

  const handleAction = () => {
    if (!user) {
      openAuthModal('register');
    } else {
      onStartCreating();
    }
  };

  return (
    <div className="min-h-screen bg-[#080F0B] pb-24 text-[#F0F5F2]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#112417] border border-emerald-800/60 text-xs font-semibold text-emerald-400">
            <span>Built for Real Business Owners</span>
            <span className="text-[#3A5243]">·</span>
            <span>Zero Tech Experience Required</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#F0F5F2] leading-tight">
            The easiest way to put your business online.
          </h1>

          <p className="text-base sm:text-lg text-[#95ADA0] leading-relaxed">
            Forget complicated website builders, hosting fees, and endless menus. Answer 5 simple questions, add your photos and prices, and have a beautiful, professional portfolio in minutes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleAction}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950/40"
            >
              <span>{user ? 'Create My Portfolio Now' : 'Sign Up & Create Portfolio'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onBackToDiscover}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0D1A12] hover:bg-[#142A1D] border border-[#193322] text-[#B8CCC0] font-semibold text-sm transition-colors"
            >
              Browse Example Portfolios
            </button>
          </div>
        </div>

        {/* 3 Step Process */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-[#F0F5F2]">
            How Hublivo Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0B150F] border border-[#173021] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#112417] text-emerald-400 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-[#F0F5F2]">5-Question Setup</h3>
              <p className="text-xs text-[#8BA494] leading-relaxed">
                Tell us your business name, where you work, and what hours you're available. No bio essays or complicated tech setups.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B150F] border border-[#173021] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#112417] text-emerald-400 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-[#F0F5F2]">Photos & Pricing</h3>
              <p className="text-xs text-[#8BA494] leading-relaxed">
                Upload photos of your real work right from your phone and list what you charge. Customers appreciate upfront pricing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B150F] border border-[#173021] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#112417] text-emerald-400 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-[#F0F5F2]">Share & Get Clients</h3>
              <p className="text-xs text-[#8BA494] leading-relaxed">
                Get discovered on Hublivo search and receive your own shareable web link to put on business cards, social media, or flyers.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="p-8 rounded-3xl bg-[#0B1710] border border-[#183523] space-y-6">
          <h3 className="text-xl font-bold text-[#F0F5F2]">Designed around how you work</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#122619] text-emerald-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#E0EBE4]">Mobile & Service Area Friendly</h4>
                <p className="text-xs text-[#8BA494] mt-1 leading-relaxed">
                  Don't have a retail storefront? No problem. Hide your home address and show only the cities or service radius you travel to.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#122619] text-emerald-400 shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#E0EBE4]">Large Visual Photo Cards</h4>
                <p className="text-xs text-[#8BA494] mt-1 leading-relaxed">
                  Clients buy with their eyes. High-resolution gallery layouts let the quality of your craft speak for itself.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#122619] text-emerald-400 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#E0EBE4]">No Hidden Booking Cuts</h4>
                <p className="text-xs text-[#8BA494] mt-1 leading-relaxed">
                  Hublivo does not take a percentage of your jobs. Clients call or message you directly, and 100% of the money is yours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#122619] text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#E0EBE4]">Save Draft & Preview Before Publishing</h4>
                <p className="text-xs text-[#8BA494] mt-1 leading-relaxed">
                  Take your time. You can save your progress at any step and preview exactly what potential customers will see.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#102919] to-[#0A170F] border border-emerald-800/40 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F0F5F2]">
            Ready to publish your business portfolio?
          </h2>
          <p className="text-sm text-[#A0BAAC] max-w-xl mx-auto">
            Join independent craftsmen, landscapers, bakers, wellness specialists, and local service providers on Hublivo.
          </p>
          <div className="pt-2">
            <button
              onClick={handleAction}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-950/60"
            >
              <span>Get Started in 5 Minutes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
