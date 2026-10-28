import React, { useState, useEffect } from 'react';
import { Business } from '../types/business';
import { fetchMyBusinesses, deleteBusiness } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Eye, Trash2, ArrowLeft, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MyPortfoliosViewProps {
  onBack: () => void;
  onEdit: (business: Business) => void;
  onView: (business: Business) => void;
  onCreateNew: () => void;
}

export const MyPortfoliosView: React.FC<MyPortfoliosViewProps> = ({
  onBack,
  onEdit,
  onView,
  onCreateNew,
}) => {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPortfolios = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyBusinesses();
      setPortfolios(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your portfolios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolios();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteBusiness(id);
      setPortfolios(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete portfolio');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080F0B] pb-24 text-[#F0F5F2]">
      {/* Sticky top control */}
      <div className="sticky top-18 z-30 bg-[#09130D]/95 backdrop-blur-md border-b border-[#162A1E] px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#A2B8AA] hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-[#122419]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discovery</span>
          </button>

          <button
            onClick={onCreateNew}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Portfolio</span>
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Business Owner Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F0F5F2]">
            My Business Portfolios
          </h1>
          <p className="text-sm text-[#8BA494] mt-1">
            Manage your published profiles, saved drafts, and active services. Only you can edit your listings.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#8BA494]">Loading your portfolios...</p>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="p-10 rounded-2xl bg-[#0B150F] border border-[#173021] text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#112417] text-emerald-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F0F5F2]">No portfolios created yet</h3>
            <p className="text-xs text-[#8BA494] leading-relaxed">
              Create your first portfolio in under 5 minutes with our easy 5-step form. No technical skills required.
            </p>
            <button
              onClick={onCreateNew}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Start My First Portfolio</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map(biz => {
              const photo = biz.photos && biz.photos.length > 0
                ? biz.photos[0]
                : '/src/assets/images/botanical_landscaping_1793147309519.jpg';

              return (
                <div
                  key={biz.id}
                  className="rounded-2xl bg-[#0B150F] border border-[#173021] overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] bg-[#070F0A]">
                      <img
                        src={photo}
                        alt={biz.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[11px] font-bold ${
                        biz.status === 'published'
                          ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-700/60'
                          : 'bg-amber-950/90 text-amber-300 border border-amber-700/60'
                      }`}>
                        {biz.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="text-xs text-emerald-400 font-medium">{biz.category}</div>
                      <h3 className="text-base font-bold text-[#F0F5F2] line-clamp-1">{biz.name}</h3>
                      <p className="text-xs text-[#8BA494] line-clamp-2">
                        {biz.tagline || (biz.locationType === 'service_area' ? biz.serviceArea : biz.address) || 'No details added yet'}
                      </p>
                      <div className="text-xs text-[#718A7B] pt-2 border-t border-[#14261B]">
                        {biz.services?.length || 0} services listed · Starting at ${biz.startingPrice}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center gap-2">
                    <button
                      onClick={() => onView(biz)}
                      className="flex-1 py-2 px-2.5 rounded-lg bg-[#112318] hover:bg-[#183323] text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5 transition-colors border border-[#1A3624]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => onEdit(biz)}
                      className="flex-1 py-2 px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(biz.id, biz.name)}
                      disabled={deletingId === biz.id}
                      className="p-2 rounded-lg bg-[#121E17] hover:bg-red-950 text-red-400 hover:text-red-300 transition-colors border border-[#1E2E23]"
                      title="Delete portfolio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
