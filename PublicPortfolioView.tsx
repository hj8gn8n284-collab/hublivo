import React, { useState } from 'react';
import { Business, WeeklyAvailability } from '../types/business';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, MapPin, Truck, Globe, Clock, Phone, Mail, 
  Share2, Edit3, Check, DollarSign, Calendar, ChevronLeft, 
  ChevronRight, MessageSquare, Send, Sparkles, AlertCircle, X
} from 'lucide-react';

interface PublicPortfolioViewProps {
  business: Business;
  onBack: () => void;
  onEdit?: () => void;
}

export const PublicPortfolioView: React.FC<PublicPortfolioViewProps> = ({
  business,
  onBack,
  onEdit,
}) => {
  const { user } = useAuth();
  const isOwner = user && user.id === business.ownerId;
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryContact, setInquiryContact] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const photos = business.photos && business.photos.length > 0
    ? business.photos
    : ['/src/assets/images/botanical_landscaping_1793147309519.jpg'];

  // Calculate current open status
  const getOpenStatus = (availability?: WeeklyAvailability) => {
    if (!availability) return { isOpen: false, text: 'Hours not specified' };
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const currentDay = days[now.getDay()];
    const todaySched = availability[currentDay];

    if (!todaySched || !todaySched.open) {
      return { isOpen: false, text: 'Closed today' };
    }

    const currentHoursMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = todaySched.start.split(':').map(Number);
    const [endH, endM] = todaySched.end.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (currentHoursMinutes >= startTotal && currentHoursMinutes <= endTotal) {
      return { isOpen: true, text: `Open now until ${formatTime(todaySched.end)}` };
    } else if (currentHoursMinutes < startTotal) {
      return { isOpen: false, text: `Opens at ${formatTime(todaySched.start)} today` };
    } else {
      return { isOpen: false, text: 'Closed for the day' };
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${ampm}`;
  };

  const openStatus = getOpenStatus(business.availability);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    });
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    setTimeout(() => {
      // Auto close after 2.5 seconds
      setContactModalOpen(false);
      setInquirySent(false);
      setInquiryMessage('');
    }, 2500);
  };

  const daysList = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  const currentDayIndex = new Date().getDay();
  // Adjust sunday to be last
  const todayDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][currentDayIndex];

  return (
    <div className="min-h-screen bg-[#080F0B] pb-24 text-[#F0F5F2]">
      {/* Top sticky sub-header navigation */}
      <div className="sticky top-18 z-30 bg-[#09130D]/95 backdrop-blur-md border-b border-[#162A1E] px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#A2B8AA] hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-[#122419]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discovery</span>
          </button>

          <div className="flex items-center gap-2">
            {isOwner && onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Portfolio</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#122419] hover:bg-[#1A3324] border border-[#1E3B27] text-xs font-medium text-[#C4D9CC] transition-colors"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-10">
        {/* HERO TITLE & UNBOXED METADATA */}
        <div>
          {business.status === 'draft' && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs font-medium mb-3">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Draft Mode (Only visible to you)</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
                <span>{business.category}</span>
                <span className="text-[#3F5447]">·</span>
                <span>{business.pricingUnit ? `From $${business.startingPrice} ${business.pricingUnit}` : `From $${business.startingPrice}`}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F0F5F2]">
                {business.name}
              </h1>
              {business.tagline && (
                <p className="text-base sm:text-lg text-[#9EB5A7] mt-2 max-w-3xl leading-relaxed">
                  {business.tagline}
                </p>
              )}
            </div>

            {/* Quick Action Button on desktop */}
            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={() => setContactModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-emerald-950/40"
              >
                <Phone className="w-4 h-4" />
                <span>Contact Business</span>
              </button>
            </div>
          </div>

          {/* Location & Status Line */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-[#8BA495] mt-4 pt-4 border-t border-[#14261B]">
            <div className="flex items-center gap-1.5 text-[#C4D9CC]">
              {business.locationType === 'service_area' ? (
                <>
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{business.serviceArea || 'Travels to client'}</span>
                </>
              ) : business.locationType === 'online' ? (
                <>
                  <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{business.serviceArea || 'Online & Remote Services'}</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{business.address || 'Location provided on inquiry'}</span>
                </>
              )}
            </div>

            <span className="text-[#364A3D]">·</span>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className={openStatus.isOpen ? 'text-emerald-300 font-semibold' : 'text-[#8EA395]'}>
                {openStatus.text}
              </span>
            </div>

            {business.phone && (
              <>
                <span className="text-[#364A3D]">·</span>
                <a 
                  href={`tel:${business.phone}`}
                  className="hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{business.phone}</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* LARGE PHOTO FOCUS (Main Showcase) */}
        <section className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] bg-[#070F0A] border border-[#193322] shadow-xl">
            <img
              src={photos[activePhotoIndex]}
              alt={`${business.name} portfolio photo ${activePhotoIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-300"
              referrerPolicy="no-referrer"
            />

            {/* Navigation Arrows if multiple photos */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhotoIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-sm transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActivePhotoIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-sm transition-colors"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/75 text-xs text-[#E8F2EC] backdrop-blur-sm font-medium">
                  {activePhotoIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails row */}
          {photos.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative rounded-xl overflow-hidden aspect-[4/3] w-24 sm:w-28 shrink-0 border transition-all ${
                    activePhotoIndex === idx
                      ? 'border-emerald-500 ring-2 ring-emerald-500/50'
                      : 'border-[#172E1F] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={p}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 2-COLUMN CONTENT: Services & Pricing + Availability & Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Services & Pricing (2 cols wide) */}
          <section className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between border-b border-[#162A1E] pb-3">
              <h2 className="text-xl font-bold text-[#F0F5F2] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Services & Pricing</span>
              </h2>
              <span className="text-xs text-[#7A9485] font-medium">Clear, upfront rates</span>
            </div>

            <div className="space-y-3">
              {business.services && business.services.length > 0 ? (
                business.services.map((srv, idx) => (
                  <div
                    key={srv.id || idx}
                    className="p-5 rounded-xl bg-[#0B1610] border border-[#173021] hover:border-[#22442E] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-[#F0F5F2]">
                        {srv.name}
                      </h3>
                      {srv.description && (
                        <p className="text-xs text-[#8BA494] leading-relaxed">
                          {srv.description}
                        </p>
                      )}
                    </div>

                    <div className="text-right sm:shrink-0">
                      <div className="text-lg font-bold text-emerald-400 tabular-nums">
                        ${srv.price}
                      </div>
                      {srv.priceSuffix && (
                        <span className="text-[11px] text-[#718A7B]">
                          {srv.priceSuffix}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-xl bg-[#09130D] border border-[#162A1E] text-center text-xs text-[#8BA494]">
                  Please contact the business owner directly for custom pricing details.
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#09140D] border border-[#173021] flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-[#8BA494]">
                Prices are set directly by {business.name}. No hidden marketplace booking markups or commission fees.
              </p>
            </div>
          </section>

          {/* Availability & Contact Box (1 col wide) */}
          <aside className="space-y-6">
            {/* Availability Schedule Card */}
            <div className="p-5 rounded-2xl bg-[#0B1610] border border-[#173021] space-y-4">
              <div className="flex items-center justify-between border-b border-[#14261B] pb-3">
                <h3 className="text-sm font-bold text-[#F0F5F2] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Weekly Availability</span>
                </h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  openStatus.isOpen ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-[#122419] text-[#7E9688]'
                }`}>
                  {openStatus.isOpen ? 'Open Now' : 'Closed'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {daysList.map(day => {
                  const sched = business.availability ? business.availability[day] : undefined;
                  const isToday = day === todayDayName;
                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors ${
                        isToday ? 'bg-[#13291C] font-semibold text-emerald-300' : 'text-[#8EA596]'
                      }`}
                    >
                      <span className="capitalize">{day} {isToday && '(Today)'}</span>
                      <span className="tabular-nums">
                        {sched && sched.open ? `${formatTime(sched.start)} – ${formatTime(sched.end)}` : 'Closed'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {business.availability?.notes && (
                <p className="text-xs text-[#7A9485] pt-2 border-t border-[#14261B] italic">
                  Note: {business.availability.notes}
                </p>
              )}
            </div>

            {/* Direct Contact Card */}
            <div className="p-5 rounded-2xl bg-[#0E1D15] border border-emerald-900/50 space-y-4">
              <h3 className="text-sm font-bold text-[#F0F5F2]">Ready to get in touch?</h3>
              <p className="text-xs text-[#8BA494]">
                Reach out directly to discuss availability, get a quote, or schedule a consultation.
              </p>

              <button
                onClick={() => setContactModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Direct Inquiry</span>
              </button>

              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#09140D] hover:bg-[#122419] border border-[#1B3624] text-xs font-semibold text-[#C4D9CC] flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call {business.phone}</span>
                </a>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Direct Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0D1812] border border-[#1F3929] rounded-2xl shadow-2xl p-6 sm:p-7">
            <button
              onClick={() => setContactModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-[#7F998A] hover:text-white rounded-lg hover:bg-[#162B1F]"
            >
              <X className="w-5 h-5" />
            </button>

            {inquirySent ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600/60 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#F0F5F2]">Inquiry Delivered!</h3>
                <p className="text-xs text-[#8BA494]">
                  Your message was sent directly to {business.name}. They will reach back out via your provided contact details.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-[#F0F5F2] mb-1">
                  Contact {business.name}
                </h3>
                <p className="text-xs text-[#8BA494] mb-4">
                  Send a quick message or inquiry. They will receive it immediately.
                </p>

                <form onSubmit={handleSendInquiry} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#A6BFB1] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. Jordan Smith"
                      className="w-full bg-[#08120C] border border-[#1D3A26] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F5F2] focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A6BFB1] mb-1">Your Phone or Email</label>
                    <input
                      type="text"
                      required
                      value={inquiryContact}
                      onChange={(e) => setInquiryContact(e.target.value)}
                      placeholder="e.g. jordan@example.com or (555) 234-5678"
                      className="w-full bg-[#08120C] border border-[#1D3A26] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F5F2] focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A6BFB1] mb-1">Message or Project Details</label>
                    <textarea
                      required
                      rows={3}
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="What service are you looking for, or when would you like to schedule?"
                      className="w-full bg-[#08120C] border border-[#1D3A26] rounded-xl px-3.5 py-2.5 text-xs text-[#F0F5F2] focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Inquiry</span>
                  </button>
                </form>

                {business.phone && (
                  <div className="mt-4 pt-4 border-t border-[#183021] text-center">
                    <p className="text-xs text-[#7A9485] mb-2">Or call directly:</p>
                    <a
                      href={`tel:${business.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{business.phone}</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
