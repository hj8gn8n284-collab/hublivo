import React, { useState } from 'react';
import { Business, ServiceItem, WeeklyAvailability, CATEGORIES } from '../types/business';
import { uploadPhoto, createBusiness, updateBusiness } from '../services/api';
import { 
  X, Check, ArrowRight, ArrowLeft, Upload, Trash2, Plus, 
  MapPin, Eye, Sparkles, Clock, DollarSign, Store, Truck, Globe,
  AlertCircle, Image as ImageIcon
} from 'lucide-react';

interface PortfolioEditorModalProps {
  business?: Business | null; // null if creating fresh
  onClose: () => void;
  onSaved: (business: Business) => void;
  onPreview: (business: Partial<Business>) => void;
}

const DEFAULT_SCHEDULE: WeeklyAvailability = {
  monday: { open: true, start: '09:00', end: '17:00' },
  tuesday: { open: true, start: '09:00', end: '17:00' },
  wednesday: { open: true, start: '09:00', end: '17:00' },
  thursday: { open: true, start: '09:00', end: '17:00' },
  friday: { open: true, start: '09:00', end: '17:00' },
  saturday: { open: false, start: '10:00', end: '15:00' },
  sunday: { open: false, start: '10:00', end: '15:00' },
  notes: ''
};

// Curated stock photos for one-click testing
const SAMPLE_PHOTOS = [
  { label: 'Landscaping & Garden', url: '/src/assets/images/botanical_landscaping_1793147309519.jpg' },
  { label: 'Woodwork & Craft', url: '/src/assets/images/artisan_woodwork_1793147310156.jpg' },
  { label: 'Bakery & Food', url: '/src/assets/images/artisan_bakery_1793147311516.jpg' },
  { label: 'Wellness & Spa', url: '/src/assets/images/forest_wellness_spa_1793147312087.jpg' },
  { label: 'Auto Detailing', url: '/src/assets/images/mobile_auto_detailing_1793147311696.jpg' }
];

export const PortfolioEditorModal: React.FC<PortfolioEditorModalProps> = ({
  business,
  onClose,
  onSaved,
  onPreview,
}) => {
  const isEditing = Boolean(business?.id);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState(business?.name || '');
  const [category, setCategory] = useState(business?.category || CATEGORIES[1]);
  const [tagline, setTagline] = useState(business?.tagline || '');
  const [locationType, setLocationType] = useState<'address' | 'service_area' | 'online'>(
    business?.locationType || 'address'
  );
  const [address, setAddress] = useState(business?.address || '');
  const [serviceArea, setServiceArea] = useState(business?.serviceArea || '');
  const [photos, setPhotos] = useState<string[]>(business?.photos || []);
  const [services, setServices] = useState<ServiceItem[]>(
    business?.services && business.services.length > 0
      ? business.services
      : [
          { id: '1', name: 'Primary Service', price: 75, priceSuffix: 'per service', description: '' }
        ]
  );
  const [startingPrice, setStartingPrice] = useState<number>(
    business?.startingPrice || 75
  );
  const [pricingUnit, setPricingUnit] = useState(business?.pricingUnit || 'session');
  const [availability, setAvailability] = useState<WeeklyAvailability>(
    business?.availability || DEFAULT_SCHEDULE
  );
  const [phone, setPhone] = useState(business?.phone || '');
  const [contactEmail, setContactEmail] = useState(business?.email || '');

  // Photo upload handling
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Read file as base64
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const uploadedUrl = await uploadPhoto(dataUrl, file.name);
        setPhotos(prev => [...prev, uploadedUrl]);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not upload photo. Please check your image size.');
    } finally {
      setUploadingPhoto(false);
      // Reset input value
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addSamplePhoto = (url: string) => {
    if (!photos.includes(url)) {
      setPhotos(prev => [...prev, url]);
    }
  };

  // Services handlers
  const handleAddService = () => {
    const newService: ServiceItem = {
      id: 'srv_' + Date.now(),
      name: '',
      price: 50,
      priceSuffix: 'service',
      description: ''
    };
    setServices(prev => [...prev, newService]);
  };

  const handleUpdateService = (index: number, updates: Partial<ServiceItem>) => {
    setServices(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleRemoveService = (index: number) => {
    if (services.length <= 1) {
      setError('Your portfolio should have at least one service.');
      return;
    }
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  // Schedule presets
  const applyPresetSchedule = (type: 'standard' | 'extended' | 'everyday') => {
    if (type === 'standard') {
      setAvailability({
        monday: { open: true, start: '09:00', end: '17:00' },
        tuesday: { open: true, start: '09:00', end: '17:00' },
        wednesday: { open: true, start: '09:00', end: '17:00' },
        thursday: { open: true, start: '09:00', end: '17:00' },
        friday: { open: true, start: '09:00', end: '17:00' },
        saturday: { open: false, start: '10:00', end: '15:00' },
        sunday: { open: false, start: '10:00', end: '15:00' },
        notes: availability.notes
      });
    } else if (type === 'extended') {
      setAvailability({
        monday: { open: true, start: '08:00', end: '18:00' },
        tuesday: { open: true, start: '08:00', end: '18:00' },
        wednesday: { open: true, start: '08:00', end: '18:00' },
        thursday: { open: true, start: '08:00', end: '18:00' },
        friday: { open: true, start: '08:00', end: '18:00' },
        saturday: { open: true, start: '09:00', end: '17:00' },
        sunday: { open: false, start: '10:00', end: '15:00' },
        notes: availability.notes
      });
    } else {
      setAvailability({
        monday: { open: true, start: '09:00', end: '18:00' },
        tuesday: { open: true, start: '09:00', end: '18:00' },
        wednesday: { open: true, start: '09:00', end: '18:00' },
        thursday: { open: true, start: '09:00', end: '18:00' },
        friday: { open: true, start: '09:00', end: '18:00' },
        saturday: { open: true, start: '09:00', end: '18:00' },
        sunday: { open: true, start: '10:00', end: '16:00' },
        notes: availability.notes
      });
    }
  };

  const handleDayToggle = (day: keyof Omit<WeeklyAvailability, 'notes'>) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        open: !prev[day].open
      }
    }));
  };

  const handleTimeChange = (
    day: keyof Omit<WeeklyAvailability, 'notes'>, 
    key: 'start' | 'end', 
    value: string
  ) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [key]: value
      }
    }));
  };

  // Compile current payload
  const buildPayload = (status: 'draft' | 'published'): Partial<Business> => {
    return {
      name: name.trim(),
      category,
      tagline: tagline.trim(),
      locationType,
      address: locationType === 'address' ? address.trim() : '',
      serviceArea: locationType === 'service_area' ? serviceArea.trim() : (locationType === 'online' ? 'Online / Remote Service' : ''),
      photos,
      startingPrice: Number(startingPrice) || (services[0]?.price || 0),
      pricingUnit,
      services: services.map(s => ({
        ...s,
        name: s.name.trim() || 'Custom Service',
        price: Number(s.price) || 0
      })),
      availability,
      phone: phone.trim(),
      email: contactEmail.trim(),
      status
    };
  };

  const handleSave = async (status: 'draft' | 'published') => {
    setError(null);
    if (!name.trim()) {
      setError('Please provide a business or professional name.');
      setCurrentStep(1);
      return;
    }

    if (status === 'published') {
      if (locationType === 'address' && !address.trim()) {
        setError('Please provide an address for your business location, or select "Mobile / Travel to customers".');
        setCurrentStep(2);
        return;
      }
      if (locationType === 'service_area' && !serviceArea.trim()) {
        setError('Please specify your service area (e.g. Portland Metro, within 25 miles).');
        setCurrentStep(2);
        return;
      }
      if (photos.length === 0) {
        setError('Please upload at least one photo of your work or select a sample photo.');
        setCurrentStep(3);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = buildPayload(status);
      let savedBiz: Business;
      if (isEditing && business?.id) {
        savedBiz = await updateBusiness(business.id, payload);
      } else {
        savedBiz = await createBusiness(payload);
      }
      onSaved(savedBiz);
    } catch (err: any) {
      setError(err.message || 'Failed to save portfolio');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerPreview = () => {
    if (!name.trim()) {
      setError('Please enter a business name first to preview.');
      setCurrentStep(1);
      return;
    }
    const payload = buildPayload('draft');
    onPreview(payload);
  };

  const steps = [
    { num: 1, title: 'Name & Category' },
    { num: 2, title: 'Location' },
    { num: 3, title: 'Photos' },
    { num: 4, title: 'Services & Prices' },
    { num: 5, title: 'Hours & Contact' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[#0B150F] border border-[#193322] rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-[#162A1D] flex items-center justify-between bg-[#08110C]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                {isEditing ? 'Editing Portfolio' : 'Easy Portfolio Creator'}
              </span>
              <span className="text-xs text-[#526B5C]">·</span>
              <span className="text-xs text-[#8BA494]">Step {currentStep} of 5</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#F0F5F2]">
              {steps[currentStep - 1].title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPreview}
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#122419] hover:bg-[#1A3524] border border-[#1E3B27] text-xs font-semibold text-emerald-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#7F998A] hover:text-white hover:bg-[#152B1E] rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#0D1A12] h-1.5">
          <div 
            className="bg-emerald-500 h-1.5 transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-5 border-b border-[#162A1D] bg-[#070E0A] text-center text-xs">
          {steps.map(s => (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              className={`py-2 px-1 transition-colors border-b-2 font-medium truncate ${
                currentStep === s.num
                  ? 'border-emerald-500 text-emerald-300 bg-[#0E1F15]'
                  : currentStep > s.num
                  ? 'border-transparent text-[#A2B8AB] hover:text-white'
                  : 'border-transparent text-[#4E6355] hover:text-[#7A9484]'
              }`}
            >
              <span className="hidden sm:inline">{s.num}. </span>{s.title}
            </button>
          ))}
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Name, Category, Starting Price */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-[#0E1D14] border border-[#173020]">
                <p className="text-xs text-emerald-300 font-medium">
                  Quick & Simple: No long bios or technical knowledge needed. Just 5 simple questions.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#E0EBE4] mb-1.5">
                  1. What is your business or professional name? <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Greenwood Tree Care, or Sarah Chen Photography"
                  className="w-full bg-[#08120C] border border-[#1D3A26] rounded-xl px-4 py-3 text-base text-[#F0F5F2] placeholder-[#4F6959] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                />
                <p className="text-xs text-[#758F80] mt-1">This will be the main title of your portfolio.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#E0EBE4] mb-1.5">
                  Select your primary category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        category === cat
                          ? 'bg-[#142A1D] border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-[#09140D] border-[#1A3323] text-[#A5BDB0] hover:border-[#284D35] hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#E0EBE4] mb-1.5">
                  One-line description of what you do (Optional)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Custom hardwood dining tables handcrafted in Seattle"
                  className="w-full bg-[#08120C] border border-[#1D3A26] rounded-xl px-4 py-2.5 text-sm text-[#F0F5F2] placeholder-[#4F6959] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#E0EBE4] mb-1.5">
                    Starting price ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#5D7868] absolute left-3 top-3.5" />
                    <input
                      type="number"
                      min={0}
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(Number(e.target.value))}
                      className="w-full bg-[#08120C] border border-[#1D3A26] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F0F5F2] focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#E0EBE4] mb-1.5">
                    Pricing unit
                  </label>
                  <select
                    value={pricingUnit}
                    onChange={(e) => setPricingUnit(e.target.value)}
                    className="w-full bg-[#08120C] border border-[#1D3A26] rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5F2] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="project">per project</option>
                    <option value="session">per session</option>
                    <option value="hour">per hour</option>
                    <option value="consultation">per consultation</option>
                    <option value="item">per item / loaf</option>
                    <option value="service">per service</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Address or Service Area */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <label className="block text-sm font-semibold text-[#E0EBE4] mb-2">
                  2. How do clients work with you?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setLocationType('address')}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      locationType === 'address'
                        ? 'bg-[#152B1E] border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-[#09140D] border-[#1A3323] hover:border-[#284D35]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#0C1B12] flex items-center justify-center text-emerald-400 mb-2">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#F0F5F2]">Physical Location</h4>
                      <p className="text-xs text-[#8AA293] mt-1">Clients visit your shop, bakery, clinic, or studio.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocationType('service_area')}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      locationType === 'service_area'
                        ? 'bg-[#152B1E] border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-[#09140D] border-[#1A3323] hover:border-[#284D35]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#0C1B12] flex items-center justify-center text-emerald-400 mb-2">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#F0F5F2]">Mobile / Travel to Client</h4>
                      <p className="text-xs text-[#8AA293] mt-1">You travel to customer homes or job sites.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocationType('online')}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      locationType === 'online'
                        ? 'bg-[#152B1E] border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-[#09140D] border-[#1A3323] hover:border-[#284D35]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#0C1B12] flex items-center justify-center text-emerald-400 mb-2">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#F0F5F2]">Online / Remote</h4>
                      <p className="text-xs text-[#8AA293] mt-1">Consulting, design, or shipping nationwide.</p>
                    </div>
                  </button>
                </div>
              </div>

              {locationType === 'address' && (
                <div className="p-5 rounded-xl bg-[#09140D] border border-[#193323] space-y-2">
                  <label className="block text-sm font-semibold text-[#E0EBE4]">
                    Street Address & City <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 1420 NW Industrial Way, Seattle, WA"
                      className="w-full bg-[#070F0A] border border-[#1D3B27] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F0F5F2] placeholder-[#4F6959] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-xs text-[#7A9485]">This address will be shown publicly so customers can visit you.</p>
                </div>
              )}

              {locationType === 'service_area' && (
                <div className="p-5 rounded-xl bg-[#09140D] border border-[#193323] space-y-2">
                  <label className="block text-sm font-semibold text-[#E0EBE4]">
                    Service Area / Radius Description <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Truck className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={serviceArea}
                      onChange={(e) => setServiceArea(e.target.value)}
                      placeholder="e.g. Greater Portland & Willamette Valley (Travels to clients)"
                      className="w-full bg-[#070F0A] border border-[#1D3B27] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F0F5F2] placeholder-[#4F6959] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-xs text-[#7A9485]">
                    Your private street address stays hidden. Customers see only the cities or regions you serve.
                  </p>
                </div>
              )}

              {locationType === 'online' && (
                <div className="p-5 rounded-xl bg-[#09140D] border border-[#193323] space-y-2">
                  <label className="block text-sm font-semibold text-[#E0EBE4]">
                    Remote Service Notice
                  </label>
                  <input
                    type="text"
                    value={serviceArea || 'Available nationwide via phone & video'}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="e.g. Available nationwide via video consultation"
                    className="w-full bg-[#070F0A] border border-[#1D3B27] rounded-xl px-4 py-3 text-sm text-[#F0F5F2] placeholder-[#4F6959] focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-xs text-[#7A9485]">No physical location will be displayed.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Photos */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <label className="block text-sm font-semibold text-[#E0EBE4] mb-1">
                  3. Business Photos <span className="text-emerald-400">*</span>
                </label>
                <p className="text-xs text-[#8BA494]">
                  Large photos are the main focus of your portfolio on Hublivo. Upload pictures of your finished work, shop, or products.
                </p>
              </div>

              {/* Big Upload Area */}
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="p-8 border-2 border-dashed border-[#1E3B27] hover:border-emerald-500 rounded-2xl bg-[#08120C] hover:bg-[#0D1D13] transition-all text-center group">
                  <div className="w-12 h-12 rounded-full bg-[#112417] text-emerald-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#F0F5F2]">
                    {uploadingPhoto ? 'Uploading photo...' : 'Click to upload photos from phone or computer'}
                  </h4>
                  <p className="text-xs text-[#738D7E] mt-1">Supports JPG, PNG, WEBP files.</p>
                </div>
              </label>

              {/* Uploaded Photos Grid */}
              {photos.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9BB3A5] mb-2">
                    Your Portfolio Gallery ({photos.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-[4/3] border border-[#1A3323] bg-[#070F0A]">
                        <img
                          src={url}
                          alt={`Uploaded photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {idx === 0 && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 text-[10px] font-bold border border-emerald-700/60">
                            Cover Photo
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/75 hover:bg-red-900 text-white transition-colors"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-300" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Library for testing */}
              <div className="p-4 rounded-xl bg-[#09140D] border border-[#1A3323]">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-[#E0EBE4]">Quick-Start Stock Photos (Click to add):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PHOTOS.map(p => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => addSamplePhoto(p.url)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                        photos.includes(p.url)
                          ? 'bg-[#152B1E] border-emerald-500 text-emerald-300'
                          : 'bg-[#0D1C13] border-[#1F3D29] text-[#9CB3A5] hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Services or Products & Prices */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <label className="block text-sm font-semibold text-[#E0EBE4] mb-1">
                  4. Services or Products and Their Prices
                </label>
                <p className="text-xs text-[#8BA494]">
                  Add the key services you offer so potential clients know what you charge upfront.
                </p>
              </div>

              <div className="space-y-3">
                {services.map((srv, idx) => (
                  <div 
                    key={srv.id || idx} 
                    className="p-4 rounded-xl bg-[#08120C] border border-[#1A3323] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-400">Service #{idx + 1}</span>
                      {services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveService(idx)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-[#9BB1A4] mb-1 font-medium">Service or Product Name</label>
                        <input
                          type="text"
                          required
                          value={srv.name}
                          onChange={(e) => handleUpdateService(idx, { name: e.target.value })}
                          placeholder="e.g. Lawn Aeration & Overseeding"
                          className="w-full bg-[#050B07] border border-[#1B3624] rounded-lg px-3 py-2 text-sm text-[#F0F5F2] placeholder-[#4F6959] focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-[#9BB1A4] mb-1 font-medium">Price ($)</label>
                        <div className="relative">
                          <DollarSign className="w-3.5 h-3.5 text-[#5D7868] absolute left-2.5 top-3" />
                          <input
                            type="number"
                            min={0}
                            value={srv.price}
                            onChange={(e) => handleUpdateService(idx, { price: Number(e.target.value) })}
                            className="w-full bg-[#050B07] border border-[#1B3624] rounded-lg pl-7 pr-3 py-2 text-sm text-[#F0F5F2] focus:outline-none focus:border-emerald-500 font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-[#9BB1A4] mb-1 font-medium">Price Note (optional)</label>
                        <input
                          type="text"
                          value={srv.priceSuffix || ''}
                          onChange={(e) => handleUpdateService(idx, { priceSuffix: e.target.value })}
                          placeholder="e.g. starting, per hour, each"
                          className="w-full bg-[#050B07] border border-[#1B3624] rounded-lg px-3 py-2 text-xs text-[#F0F5F2] placeholder-[#4F6959] focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs text-[#9BB1A4] mb-1 font-medium">Brief Details (optional)</label>
                        <input
                          type="text"
                          value={srv.description || ''}
                          onChange={(e) => handleUpdateService(idx, { description: e.target.value })}
                          placeholder="e.g. Includes edge trimming and yard debris removal"
                          className="w-full bg-[#050B07] border border-[#1B3624] rounded-lg px-3 py-2 text-xs text-[#F0F5F2] placeholder-[#4F6959] focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddService}
                className="w-full py-3 px-4 border border-dashed border-[#1E3E29] hover:border-emerald-500 rounded-xl bg-[#0A160F] text-xs font-semibold text-emerald-300 hover:text-emerald-200 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Another Service or Product</span>
              </button>
            </div>
          )}

          {/* STEP 5: Availability Hours & Contact */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <label className="block text-sm font-semibold text-[#E0EBE4] mb-1">
                  5. Availability Hours for Each Day
                </label>
                <p className="text-xs text-[#8BA494]">
                  Let customers know when you're open or available for bookings.
                </p>
              </div>

              {/* Fast Presets */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-[#7A9485] font-medium mr-1">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPresetSchedule('standard')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-[#0E1F15] hover:bg-[#142A1D] border border-[#1A3323] text-emerald-300 transition-colors"
                >
                  Standard Mon–Fri (9–5)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetSchedule('extended')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-[#0E1F15] hover:bg-[#142A1D] border border-[#1A3323] text-emerald-300 transition-colors"
                >
                  Mon–Sat (8–6)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetSchedule('everyday')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-[#0E1F15] hover:bg-[#142A1D] border border-[#1A3323] text-emerald-300 transition-colors"
                >
                  Everyday (9–6)
                </button>
              </div>

              {/* Day-by-Day schedule list */}
              <div className="space-y-2 bg-[#08120C] border border-[#183121] rounded-xl p-3 sm:p-4">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map(day => {
                  const daySched = availability[day];
                  return (
                    <div 
                      key={day}
                      className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-[#13261A] last:border-0 gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                            daySched.open ? 'bg-emerald-600' : 'bg-[#1C3626]'
                          }`}
                        >
                          <span 
                            className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                              daySched.open ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="capitalize text-xs font-semibold text-[#E0EBE4] w-24">
                          {day}
                        </span>
                      </div>

                      {daySched.open ? (
                        <div className="flex items-center gap-2 text-xs">
                          <input
                            type="time"
                            value={daySched.start}
                            onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                            className="bg-[#050A07] border border-[#1E3B27] rounded px-2 py-1 text-xs text-[#F0F5F2]"
                          />
                          <span className="text-[#6C8576]">to</span>
                          <input
                            type="time"
                            value={daySched.end}
                            onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                            className="bg-[#050A07] border border-[#1E3B27] rounded px-2 py-1 text-xs text-[#F0F5F2]"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-[#5D7366] italic">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Contact Information */}
              <div className="pt-2 border-t border-[#162A1D] space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  How Customers Contact You
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#A6BFB1] mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full bg-[#08120C] border border-[#1D3A26] rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5F2] placeholder-[#4F6959] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A6BFB1] mb-1">Direct Contact Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="hello@yourbusiness.com"
                      className="w-full bg-[#08120C] border border-[#1D3A26] rounded-xl px-3.5 py-2.5 text-sm text-[#F0F5F2] placeholder-[#4F6959] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 sm:p-5 border-t border-[#162A1D] bg-[#070E0A] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-3.5 py-2 rounded-xl bg-[#0D1A12] hover:bg-[#142A1D] border border-[#1C3625] text-xs font-semibold text-[#A6BFB1] hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="px-3.5 py-2 rounded-xl bg-[#0D1A12] hover:bg-[#142A1D] border border-[#1C3625] text-xs font-semibold text-[#A6BFB1] hover:text-white transition-colors"
            >
              Save Draft
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setCurrentStep(prev => prev + 1);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave('published')}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-950/40"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Publishing...' : isEditing ? 'Update & Publish' : 'Publish Portfolio'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
