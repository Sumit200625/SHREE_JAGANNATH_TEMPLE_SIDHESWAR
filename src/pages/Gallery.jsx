import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Image as ImageIcon, Search, PlusCircle, ShieldAlert, Award, ArrowLeft, ArrowRight, X, Play, Upload } from 'lucide-react';

// Local helper for image skeleton and fallback loading
function ImageWithSkeleton({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div className="relative w-full h-full bg-temple-100 dark:bg-temple-darker animate-pulse overflow-hidden rounded-2xl">
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={error ? "/assets/temple_spire_flags.jpg" : src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      />
    </div>
  );
}

export default function Gallery() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [galleryItems, setGalleryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Upload Form
  const [uploadOpen, setUploadOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Devotee Events',
    url: '',
    caption: ''
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  // Fetch gallery items
  useEffect(() => {
    api.getGallery().then(approved => {
      setGalleryItems(approved);
      setFilteredItems(approved);
    }).catch(() => {});
  }, []);

  // Filter & Search
  useEffect(() => {
    let result = galleryItems;

    if (activeFilter !== 'all') {
      result = result.filter(item => item.category === activeFilter);
    }

    if (searchQuery) {
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredItems(result);
  }, [activeFilter, searchQuery, galleryItems]);

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { setUploadMsg('Please choose a JPG, PNG or WEBP photo.'); return; }
    setUploadMsg('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setUploadMsg('Please choose a photo first.'); return; }
    setUploadLoading(true);
    setUploadMsg('');
    try {
      const { url } = await api.uploadImage(file);
      const item = await api.addGalleryItem({
        title: formData.title, category: formData.category, imageUrl: url, caption: formData.caption,
      });
      if (item.isApproved) {
        setUploadMsg('Photo uploaded and published.');
        api.getGallery().then(setGalleryItems).catch(() => {});
      } else {
        setUploadMsg('Thank you! Your photo was submitted and will appear after the temple committee approves it.');
      }
      setFormData({ title: '', category: 'Devotee Events', url: '', caption: '' });
      setFile(null);
      setPreview('');
      setTimeout(() => { setUploadMsg(''); setUploadOpen(false); }, 4000);
    } catch (err) {
      setUploadMsg(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
  };

  const closeLightbox = () => {
    setLightboxIndex(-1);
  };

  const navigateLightbox = (dir) => {
    let nextIdx = lightboxIndex + dir;
    if (nextIdx < 0) nextIdx = filteredItems.length - 1;
    if (nextIdx >= filteredItems.length) nextIdx = 0;
    setLightboxIndex(nextIdx);
  };

  const filters = [
    { code: 'all', label: 'All Photos' },
    { code: 'Temple', label: 'Temple (ମନ୍ଦିର)' },
    { code: 'Deities', label: 'Deities (ଶ୍ରୀବିଗ୍ରହ)' },
    { code: 'Festivals', label: 'Festivals (ପର୍ବପର୍ବାଣୀ)' },
    { code: 'Rath Yatra', label: 'Rath Yatra (ରଥଯାତ୍ରା)' },
    { code: 'Bhoga/Prasad', label: 'Bhoga & Prasad (ପ୍ରସାଦ)' },
    { code: 'Devotee Events', label: 'Devotee Events (ଶ୍ରଦ୍ଧାଳୁ ଉତ୍ସବ)' },
    { code: 'Old Photos', label: 'Old Photos (ପୁରୁଣା ଫଟୋ)' }
  ];

  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      
      {/* Page Header */}
      <div className="relative bg-temple-dark text-cream-light py-20 border-b border-gold/20 text-center">
        <div className="absolute inset-0 bg-[url('/assets/temple_chariot_sunset.jpg')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-glow text-white">
            {t('gallery')}
          </h2>
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className="w-10 h-0.5 bg-gold"></span>
            <ImageIcon size={20} className="text-gold" />
            <span className="w-10 h-0.5 bg-gold"></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8">
        
        {/* Important restriction banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-semibold flex items-center gap-2">
          <ShieldAlert className="text-saffron shrink-0" size={16} />
          <span>Notice: Photography or videography of restricted inner rituals is strictly not allowed inside the sanctum.</span>
        </div>

        {/* Filter Toolbar & Upload Action */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          {/* Scrollable Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 no-scrollbar">
            {filters.map((f) => (
              <button
                key={f.code}
                onClick={() => setActiveFilter(f.code)}
                className={`px-4 py-2 rounded-full text-xs font-bold font-outfit whitespace-nowrap transition-colors border ${
                  activeFilter === f.code
                    ? 'bg-saffron border-saffron text-white shadow-sm'
                    : 'bg-white border-saffron/10 hover:bg-saffron/5 text-temple-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex gap-4 w-full lg:w-auto shrink-0 justify-end">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-temple-400" size={14} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gallery..."
                className="pl-8 pr-3 py-2 bg-white border border-saffron/20 rounded-xl text-xs focus:outline-none"
              />
            </div>

            {/* Devotee Upload Trigger */}
            <button 
              onClick={() => setUploadOpen(true)}
              className="px-4 py-2 bg-maroon hover:bg-maroon-light text-cream-light font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <PlusCircle size={14} />
              <span>Contribute Photo</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="glass-card p-12 text-center text-temple-600 font-semibold border-t-4 border-maroon">
            <ImageIcon size={48} className="text-maroon mx-auto mb-4 animate-bounce" />
            <p>No photos or videos found matching your filters.</p>
          </div>
        )}

        {/* Gallery Grid */}
        {filteredItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item, idx) => (
              <div 
                key={item.id} 
                onClick={() => openLightbox(idx)}
                className="group relative h-48 md:h-56 bg-temple-100 rounded-2xl overflow-hidden border border-saffron/5 shadow-sm cursor-pointer"
              >
                <ImageWithSkeleton 
                  src={item.imageUrl} 
                  alt={item.altText || item.title} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                  {item.imageUrl.includes('youtube') || item.imageUrl.includes('mp4') ? (
                    <div className="absolute top-3 right-3 p-2 bg-saffron text-white rounded-full"><Play size={14} /></div>
                  ) : null}
                  <h4 className="font-bold text-xs">{item.title}</h4>
                  <span className="text-[10px] text-cream-light/75 capitalize mt-0.5">{item.category.replace(/_/g, ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Lightbox Modal slider */}
      {lightboxIndex >= 0 && filteredItems[lightboxIndex] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button onClick={closeLightbox} className="absolute top-6 right-6 text-white hover:text-gold p-2 z-50"><X size={32} /></button>
          <button onClick={() => navigateLightbox(-1)} className="absolute left-6 text-white hover:text-gold p-3 z-50 bg-black/40 rounded-full"><ArrowLeft size={24} /></button>
          <button onClick={() => navigateLightbox(1)} className="absolute right-6 text-white hover:text-gold p-3 z-50 bg-black/40 rounded-full"><ArrowRight size={24} /></button>

          <div className="max-w-4xl max-h-[80vh] px-4 flex flex-col items-center gap-4">
            <img 
              src={filteredItems[lightboxIndex].imageUrl} 
              alt={filteredItems[lightboxIndex].altText || filteredItems[lightboxIndex].title} 
              className="max-h-[70vh] object-contain rounded-lg shadow-2xl border-2 border-gold/30"
            />
            <div className="text-center text-white space-y-1 bg-black/60 p-4 rounded-xl max-w-xl">
              <h4 className="text-sm md:text-base font-bold text-gold">{filteredItems[lightboxIndex].title}</h4>
              {filteredItems[lightboxIndex].caption && (
                <p className="text-xs text-cream-light/95 italic mt-1">{filteredItems[lightboxIndex].caption}</p>
              )}
              <p className="text-[10px] md:text-xs text-cream-light/60 mt-1">
                Uploaded by: {filteredItems[lightboxIndex].uploadedBy || "Temple Trust"} | Category: {filteredItems[lightboxIndex].category.replace(/_/g, ' ')} {filteredItems[lightboxIndex].date && `| Date: ${filteredItems[lightboxIndex].date}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contributor Photo Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-temple-dark rounded-2xl max-w-md w-full border border-gold/30 shadow-2xl animate-slide-up">
            <div className="p-6 border-b border-saffron/10 flex items-center justify-between">
              <h3 className="text-lg font-bold font-outfit text-maroon flex items-center gap-2">
                <Upload className="text-saffron" size={18} />
                <span>Contribute to Temple Gallery</span>
              </h3>
              <button onClick={() => setUploadOpen(false)} className="text-temple-500 hover:text-maroon font-bold text-xl">&times;</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs font-semibold">
              {!isAuthenticated && (
                <div className="p-3 bg-gold/10 border border-gold/30 rounded-lg text-[11px]">
                  Please <a href="/login" className="text-saffron font-bold underline">log in</a> to upload a photo.
                </div>
              )}
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-lg">
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed">
                  Upload a photo from your phone or computer (large photos are reduced automatically). Photos from devotees are shown after the temple committee approves them. Inappropriate uploads are removed.
                </p>
              </div>

              {/* Title */}
              <div className="flex flex-col space-y-1">
                <label className="text-temple-700 uppercase">Photo Title</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Rath Yatra Chariot Preparation"
                  className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                />
              </div>

              {/* Caption */}
              <div className="flex flex-col space-y-1">
                <label className="text-temple-700 uppercase">Photo Caption</label>
                <input 
                  type="text"
                  value={formData.caption}
                  onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="e.g. Adorned with Tulasi leaves on altar"
                  className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col space-y-1">
                <label className="text-temple-700 uppercase">Gallery Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl focus:outline-none"
                >
                  <option value="Temple">Temple (ମନ୍ଦିର)</option>
                  <option value="Deities">Deities (ଶ୍ରୀବିଗ୍ରହ)</option>
                  <option value="Festivals">Festivals (ପର୍ବପର୍ବାଣୀ)</option>
                  <option value="Rath Yatra">Rath Yatra (ରଥଯାତ୍ରା)</option>
                  <option value="Bhoga/Prasad">Bhoga & Prasad (ପ୍ରସାଦ)</option>
                  <option value="Devotee Events">Devotee Events (ଶ୍ରଦ୍ଧାଳୁ ଉତ୍ସବ)</option>
                  <option value="Old Photos">Old Photos (ପୁରୁଣา ଫଟୋ)</option>
                </select>
              </div>

              {/* Image URL Link */}
              <div className="flex flex-col space-y-1">
                <label className="text-temple-700 uppercase">Photo (JPG / PNG / WEBP)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={pickFile}
                  className="px-3 py-2.5 bg-temple-50 border border-saffron/20 rounded-xl text-xs file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-saffron file:text-white file:font-bold"
                />
                {preview && <img src={preview} alt="Preview" className="mt-2 max-h-40 rounded-xl object-cover border border-saffron/20" />}
              </div>

              {uploadMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] rounded-lg leading-relaxed font-semibold break-words">
                  {uploadMsg}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  className="px-4 py-2 border border-saffron text-saffron rounded-lg hover:bg-saffron/5"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploadLoading || !isAuthenticated}
                  className="px-4 py-2 bg-saffron hover:bg-saffron-dark text-white rounded-lg disabled:opacity-50"
                >
                  {uploadLoading ? 'Uploading...' : 'Submit Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
