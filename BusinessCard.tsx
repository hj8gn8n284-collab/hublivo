import React from 'react';
import { Business, WeeklyAvailability } from '../types/business';
import { MapPin, Truck, Globe, Clock, ArrowRight } from 'lucide-react';

interface BusinessCardProps {
  business: Business;
  onView: (business: Business) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, onView }) => {
  const photo = business.photos && business.photos.length > 0
    ? business.photos[0]
    : '/src/assets/images/botanical_landscaping_1793147309519.jpg';

  // Calculate today's open status
  const getTodayHoursSummary = (availability?: WeeklyAvailability) => {
    if (!availability) return 'Contact for hours';
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const currentDay = days[now.getDay()];
    const sched = availability[currentDay];

    if (!sched || !sched.open) {
      return 'Closed today';
    }

    const formatT = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const dh = h % 12 || 12;
      return `${dh}:${m < 10 ? '0' + m : m} ${ampm}`;
    };

    return `Open today: ${formatT(sched.start)} – ${formatT(sched.end)}`;
  };

  const todayHours = getTodayHoursSummary(business.availability);
  const isOpen = !todayHours.includes('Closed');

  return (
    <article 
      onClick={() => onView(business)}
      className="group cursor-pointer rounded-2xl bg-[#0B150F] border border-[#173021] hover:border-[#275338] transition-all duration-200 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-emerald-950/20"
    >
      <div>
        {/* Large Business Photo - Main Focus */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#070F0A]">
          <img
            src={photo}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B150F] via-transparent to-transparent opacity-60" />
          
          {/* Subtle Price Tag overlay */}
          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-xs font-semibold text-[#F0F5F2]">
            <span>From ${business.startingPrice}</span>
            {business.pricingUnit && <span className="text-[#96ADA0] font-normal text-[11px] ml-1">/ {business.pricingUnit}</span>}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Clean Unboxed Metadata (Zero-Pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-[#7F9C8B]">
            <span className="text-emerald-400 font-semibold">{business.category}</span>
            <span aria-hidden="true" className="text-[#3A5042]">·</span>
            <span className="truncate">
              {business.services?.length ? `${business.services.length} services` : 'Portfolio'}
            </span>
          </div>

          {/* Business Name */}
          <h3 className="text-lg font-bold text-[#F0F5F2] group-hover:text-emerald-300 transition-colors line-clamp-1">
            {business.name}
          </h3>

          {/* Tagline if available */}
          {business.tagline && (
            <p className="text-xs text-[#8EA395] line-clamp-2 leading-relaxed">
              {business.tagline}
            </p>
          )}

          {/* Address / Service Area */}
          <div className="flex items-center gap-1.5 text-xs text-[#9BB1A4]">
            {business.locationType === 'service_area' ? (
              <>
                <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{business.serviceArea || 'Travels to client'}</span>
              </>
            ) : business.locationType === 'online' ? (
              <>
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{business.serviceArea || 'Online Services'}</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{business.address || 'Address provided on request'}</span>
              </>
            )}
          </div>

          {/* Availability Hours */}
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className={isOpen ? 'text-[#C5D9CD]' : 'text-[#738A7C]'}>
              {todayHours}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer with View Portfolio Button */}
      <div className="p-4 sm:p-5 pt-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView(business);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-[#122419] hover:bg-emerald-600 group-hover:bg-emerald-600 text-emerald-300 group-hover:text-white hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#1E3B28] group-hover:border-transparent"
        >
          <span>View Portfolio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
