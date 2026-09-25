import React, { useState, useEffect, useRef } from 'react';
import { fetchPaleoData, fetchSitesForQuery, generateTaxaBlueprint } from './services/geminiService';
import { PaleoData, SiteMarker, FossilAnalysisResult } from './types';
import { DINOSAUR_DB } from './data/dinosaurData';
import MapCanvas from './components/MapCanvas';
import { TechIcon, DinoIcon } from './components/Icons';
import { FossilUploadModal } from './components/FossilUploadModal';
import { FieldReportModal } from './components/FieldReportModal';
import { GeologicalTimeline } from './components/GeologicalTimeline';
import { SpecimenComparator } from './components/SpecimenComparator';
import { 
  Loader2, 
  Map as MapIcon, 
  Globe, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  RotateCcw, 
  Activity, 
  Bone, 
  Trees, 
  Users, 
  User, 
  Bird, 
  Zap, 
  Component,
  Sparkles,
  Compass,
  Footprints,
  Layers,
  Clock,
  ShieldAlert,
  Leaf,
  MapPin,
  Upload,
  Camera,
  Trash2,
  Eye,
  CheckCircle2,
  Maximize2,
  Award,
  ShieldCheck,
  Tag,
  Info,
  ExternalLink,
  Printer,
  FileText,
  X,
  ArrowLeftRight
} from 'lucide-react';

const TAXA = DINOSAUR_DB.map(d => d.name);

type TabType = 'fossil' | 'overview' | 'inventory' | 'metrics';

const App: React.FC = () => {
  const [markers, setMarkers] = useState<SiteMarker[]>([]);
  const [selectedSite, setSelectedSite] = useState<PaleoData | null>(null);
  const [blueprintImage, setBlueprintImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [activeQuery, setActiveQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [inventorySubView, setInventorySubView] = useState<'comparator' | 'stratum'>('comparator');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mobileTab, setMobileTab] = useState<'map' | 'journal'>('map');

  // User's fossil upload and collection state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeFossil, setActiveFossil] = useState<FossilAnalysisResult | null>(null);
  const [imageDisplayMode, setImageDisplayMode] = useState<'reconstruction' | 'fossil_photo'>('reconstruction');
  const [enlargedPhotoUrl, setEnlargedPhotoUrl] = useState<string | null>(null);
  const [fossilCollection, setFossilCollection] = useState<FossilAnalysisResult[]>(() => {
    try {
      const saved = localStorage.getItem('dino_fossil_collection');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const currentBlueprintTaxa = useRef<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('dino_fossil_collection', JSON.stringify(fossilCollection));
    } catch (e) {
      console.error('Failed to sync fossil collection to storage:', e);
    }
  }, [fossilCollection]);

  const updateBlueprint = async (taxa: string) => {
    if (currentBlueprintTaxa.current === taxa && imgLoading) return;
    
    currentBlueprintTaxa.current = taxa;
    setImgLoading(true);
    setImgError(false);
    
    try {
      const img = await generateTaxaBlueprint(taxa);
      if (currentBlueprintTaxa.current === taxa) {
        setBlueprintImage(img);
      }
    } catch (err) {
      console.error("Blueprint generation failed", err);
      if (currentBlueprintTaxa.current === taxa) {
        setImgError(true);
      }
    } finally {
      if (currentBlueprintTaxa.current === taxa) {
        setImgLoading(false);
      }
    }
  };

  const handleQuerySelect = async (query: string) => {
    if (query === activeQuery && !activeFossil) return;
    setLoading(true);
    setActiveQuery(query);
    setActiveFossil(null);
    setSelectedSite(null);
    setMarkers([]);
    setBlueprintImage(null);
    setImgError(false);
    setImageDisplayMode('reconstruction');
    setActiveTab('overview');
    currentBlueprintTaxa.current = null;
    setCurrentIndex(0);
    
    // Always update blueprint for the taxon
    updateBlueprint(query);

    try {
      const results = await fetchSitesForQuery(query);
      setMarkers(results);
      if (results.length > 0) {
        handleSiteSelect(results[0], true, query);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSiteSelect = async (marker: SiteMarker, skipBlueprintFetch: boolean = false, speciesName?: string) => {
    setLoading(true);
    const taxaToSearch = speciesName || activeQuery;
    try {
      const details = await fetchPaleoData(marker.name, taxaToSearch);
      setSelectedSite(details);
      
      if (!skipBlueprintFetch && !blueprintImage && !imgLoading) {
        updateBlueprint(taxaToSearch);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFossilIdentified = (payload: {
    result: FossilAnalysisResult;
    paleoData: PaleoData;
    markers: SiteMarker[];
  }) => {
    const { result, paleoData, markers: identifiedMarkers } = payload;
    
    // Add to collection if not already present
    setFossilCollection((prev) => {
      const exists = prev.some((item) => item.id === result.id);
      return exists ? prev : [result, ...prev];
    });

    setActiveFossil(result);
    setActiveQuery(result.taxaName);
    setSelectedSite(paleoData);
    setMarkers(identifiedMarkers);
    setCurrentIndex(0);
    setActiveTab('fossil');
    setImageDisplayMode('fossil_photo');
    setBlueprintImage(null);
    currentBlueprintTaxa.current = null;
    setMobileTab('journal');

    // Trigger AI living reconstruction of this identified species
    updateBlueprint(result.taxaName);
  };

  const handleSelectSavedFossil = (fossil: FossilAnalysisResult) => {
    setActiveFossil(fossil);
    setActiveQuery(fossil.taxaName);
    setActiveTab('fossil');
    setImageDisplayMode('fossil_photo');
    setCurrentIndex(0);

    // Reconstruct site markers with primary origin
    const primaryMarker: SiteMarker = {
      name: `${fossil.primaryFormation.name} (${fossil.primaryFormation.country})`,
      lat: fossil.primaryFormation.coordinates.lat,
      lng: fossil.primaryFormation.coordinates.lng,
      id: `marker-origin-${fossil.id}`,
      isFossilOrigin: true
    };

    const altMarkers: SiteMarker[] = (fossil.alternativeSites || []).map((s, i) => ({
      name: `${s.name} (${s.country})`,
      lat: s.coordinates.lat,
      lng: s.coordinates.lng,
      id: `marker-alt-${i}-${fossil.id}`,
      isFossilOrigin: false
    }));

    const restoredMarkers = [primaryMarker, ...altMarkers];
    setMarkers(restoredMarkers);

    const paleoData: PaleoData = {
      name: primaryMarker.name,
      coordinates: fossil.primaryFormation.coordinates,
      summary: fossil.scientificDescription,
      geologicalContext: {
        era: fossil.geologicalEra,
        period: fossil.geologicalPeriod,
        climate: fossil.primaryFormation.environment,
        age: fossil.estimatedAge
      },
      stats: [
        { label: "Specimen Element", value: fossil.elementIdentified, subtext: fossil.fossilCategory, iconType: "discovery" },
        { label: "Geological Era", value: fossil.geologicalEra, subtext: fossil.geologicalPeriod, iconType: "era" },
        { label: "Origin Formation", value: fossil.primaryFormation.name, subtext: `${fossil.primaryFormation.locationName}, ${fossil.primaryFormation.country}`, iconType: "geology" },
        { label: "Identification Match", value: `${fossil.confidenceScore}% (${fossil.confidenceLevel})`, subtext: fossil.preservationQuality, iconType: "status" }
      ],
      features: fossil.visualObservations.map((obs, idx) => ({
        name: `Diagnostic Clue #${idx + 1}`,
        description: obs,
        category: "skull"
      })),
      metadata: {
        threatLevel: "Prehistoric Organism",
        threatScore: 4,
        diet: "Carnivore / Herbivore",
        packBehavior: "Fossil Specimen",
        integument: "Mineralized fossil structure",
        flight: "Non-flighted",
        osteologicalCompleteness: 85
      }
    };

    setSelectedSite(paleoData);
    updateBlueprint(fossil.taxaName);
  };

  const handleDeleteSavedFossil = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFossilCollection((prev) => prev.filter((item) => item.id !== id));
    if (activeFossil?.id === id) {
      setActiveFossil(null);
      if (TAXA.length > 0) {
        handleQuerySelect(TAXA[0]);
      }
    }
  };

  const goToNextSite = () => {
    if (markers.length === 0) return;
    const nextIdx = (currentIndex + 1) % markers.length;
    setCurrentIndex(nextIdx);
    if (!activeFossil) {
      handleSiteSelect(markers[nextIdx], true);
    }
  };

  const goToPrevSite = () => {
    if (markers.length === 0) return;
    const prevIdx = (currentIndex - 1 + markers.length) % markers.length;
    setCurrentIndex(prevIdx);
    if (!activeFossil) {
      handleSiteSelect(markers[prevIdx], true);
    }
  };

  const sectionLabelStyle = "text-[12px] font-extrabold text-park-ink tracking-wider mb-2 flex items-center gap-1.5 font-rounded uppercase";

  return (
    <div className="flex flex-col h-screen h-[100dvh] w-full max-w-full bg-park-card text-park-ink font-sans overflow-hidden relative selection:bg-park-land/40">
      
      {/* Top Navigation Bar */}
      <header className="flex-none border-b border-park-card-border bg-[#faf8f2] z-20 flex flex-col shadow-xs">
        {/* Top row: Brand & Primary Actions */}
        <div className="px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 flex-none min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-park-land/35 border border-park-border-green/40 flex items-center justify-center text-park-tree shadow-xs p-1 shrink-0">
              <DinoIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-park-tree" />
            </div>
            <div className="min-w-0">
              <div className="text-[17px] sm:text-[24px] font-hand font-bold text-park-ink leading-none truncate">
                Oleg's Fossil Collection
              </div>
              <span className="text-[8px] sm:text-[9px] font-rounded font-semibold text-park-ink-muted block mt-0.5 uppercase tracking-wider truncate">
                Paleo Field Guide & Origin Map
              </span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Export Report Button in Header (Active when a site or specimen is selected) */}
            {selectedSite && (
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-semibold tracking-tight border transition-all duration-200 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 border-gray-300 shadow-2xs hover:shadow flex items-center gap-1.5 active:scale-95 group"
                title="Export Field Documentation & Specimen Report (PDF / Markdown)"
              >
                <Printer size={13} className="text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Export Report (PDF)</span>
                <span className="sm:hidden">PDF</span>
              </button>
            )}

            {/* Primary Action: Upload Photo From Fossil Collection */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-rounded font-extrabold tracking-wide border transition-all duration-200 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-amber-600 shadow-sm hover:shadow flex items-center gap-1.5 sm:gap-2 active:scale-95 group"
            >
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                <Upload size={10} className="group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <span className="hidden xs:inline">Upload Fossil Photo</span>
              <span className="xs:hidden">Upload</span>
              <Sparkles size={12} className="text-amber-200 animate-pulse hidden sm:inline" />
            </button>
          </div>
        </div>

        {/* Species & Saved Fossils Horizontal Carousel Strip */}
        <div className="px-3.5 sm:px-6 py-1.5 border-t border-park-card-border/60 bg-[#f7f5ed] flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {/* User's Saved Fossil Collection Pills (if any) */}
          {fossilCollection.length > 0 && (
            <div className="flex items-center gap-1.5 pr-2.5 border-r border-park-card-border flex-none">
              <span className="text-[10px] font-rounded font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Award size={12} className="text-amber-600" />
                <span className="hidden sm:inline">Oleg's Collection ({fossilCollection.length})</span>
                <span className="sm:hidden">Saved ({fossilCollection.length})</span>
              </span>

              {fossilCollection.map((fossil) => {
                const isActive = activeFossil?.id === fossil.id;
                return (
                  <div
                    key={fossil.id}
                    className={`inline-flex items-center rounded-full text-[11px] font-rounded border transition-all pl-2.5 pr-1.5 py-1 gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-bold scale-[1.02]'
                        : 'bg-amber-50/70 border-amber-300 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectSavedFossil(fossil)}
                      className="truncate max-w-[120px] sm:max-w-[140px]"
                      title={fossil.specimenTitle}
                    >
                      ★ {fossil.commonName}
                    </button>
                    <button
                      onClick={(e) => handleDeleteSavedFossil(fossil.id, e)}
                      title="Remove specimen"
                      className={`p-0.5 rounded-full hover:bg-black/15 transition-colors ${
                        isActive ? 'text-white/80 hover:text-white' : 'text-amber-700'
                      }`}
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Standard Dinosaur Taxa Pills */}
          <div className="flex items-center gap-1.5 flex-none">
            <span className="text-[10px] font-rounded font-extrabold text-park-ink-muted uppercase tracking-wider hidden lg:inline-block shrink-0">
              Species Index:
            </span>
            {TAXA.map((t, idx) => {
              const isActive = activeQuery === t && !activeFossil;
              const pillColors = [
                'hover:border-emerald-500 hover:text-emerald-800',
                'hover:border-amber-500 hover:text-amber-800',
                'hover:border-sky-500 hover:text-sky-800',
                'hover:border-rose-500 hover:text-rose-800',
                'hover:border-purple-500 hover:text-purple-800',
                'hover:border-teal-500 hover:text-teal-800'
              ];
              const activeBg = 'bg-park-tree text-white border-park-tree shadow-xs font-bold scale-[1.02]';
              const inactiveBg = 'bg-white/80 border-park-card-border text-park-ink-muted hover:bg-white ' + pillColors[idx % pillColors.length];

              return (
                <button 
                  key={t} 
                  onClick={() => handleQuerySelect(t)}
                  className={`px-3 py-1 sm:py-1.5 rounded-full text-[11px] font-rounded tracking-wide border transition-all duration-200 shrink-0 ${
                    isActive ? activeBg : inactiveBg
                  }`}
                >
                  <span>{t}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Column: Interactive Cartographic Map */}
        <main className={`flex-1 h-full relative group/map overflow-hidden z-0 isolate ${
          mobileTab === 'journal' ? 'hidden md:block' : 'block'
        }`}>
           <MapCanvas 
             markers={markers} 
             selectedMarkerId={markers[currentIndex]?.name} 
             onMarkerClick={(site) => {
               const idx = markers.findIndex(m => m.id === site.id);
               if (idx !== -1) setCurrentIndex(idx);
               if (!activeFossil) {
                 handleSiteSelect(site, true);
               }
             }} 
             activeTaxaName={activeQuery}
             fossilSpecimenTitle={activeFossil ? activeFossil.specimenTitle : undefined}
           />
           
           {/* Desktop Floating Site Carousel Controller */}
           {activeQuery && markers.length > 0 && (
             <div className="hidden md:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto items-center gap-1.5 bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-full px-2 py-1.5 shadow-[0_3px_10px_rgba(0,0,0,0.2)]">
                <button 
                  onClick={(e) => { e.stopPropagation(); goToPrevSite(); }}
                  disabled={markers.length <= 1}
                  className="w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous Fossil Site"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-2 px-2.5">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${activeFossil ? 'bg-amber-500' : 'bg-[#ea4335]'}`}></div>
                  <span className="text-xs font-semibold text-gray-900 tracking-tight">
                    {activeFossil ? 'Dig Locality' : 'Site'} {markers.length > 0 ? currentIndex + 1 : 0} of {markers.length}
                  </span>
                  <span className="text-xs text-gray-500 max-w-[200px] truncate font-medium">
                    • {markers[currentIndex]?.name || 'Loading'}
                  </span>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); goToNextSite(); }}
                  disabled={markers.length <= 1}
                  className="w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next Fossil Site"
                >
                  <ChevronRight size={16} />
                </button>
             </div>
           )}

           {/* Mobile Floating Site Preview Card (Tappable to expand into full journal) */}
           {selectedSite && (
             <div className="md:hidden absolute bottom-18 left-3 right-3 z-30 pointer-events-auto bg-[#faf8f2]/95 backdrop-blur-md border border-[#c4b59d] rounded-2xl p-2.5 shadow-xl flex items-center gap-2.5 animate-in">
               {/* Thumbnail / Fossil Graphic */}
               <div 
                 onClick={() => setMobileTab('journal')}
                 className="w-12 h-12 rounded-xl bg-white border border-[#c4b59d] overflow-hidden shrink-0 flex items-center justify-center cursor-pointer shadow-2xs"
               >
                 {activeFossil?.userPhotoUrl ? (
                   <img src={activeFossil.userPhotoUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                 ) : blueprintImage ? (
                   <img src={blueprintImage} alt="Thumbnail" className="w-full h-full object-cover" />
                 ) : (
                   <DinoIcon className="w-6 h-6 fill-park-tree" />
                 )}
               </div>

               {/* Info */}
               <div 
                 onClick={() => setMobileTab('journal')}
                 className="min-w-0 flex-1 cursor-pointer"
               >
                 <div className="flex items-center gap-1.5">
                   <span className="text-[9px] font-rounded font-extrabold uppercase text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded shrink-0">
                     {activeFossil ? 'Fossil' : 'Site'} {markers.length > 0 ? currentIndex + 1 : 1}/{markers.length || 1}
                   </span>
                   <span className="text-[10px] font-rounded text-park-ink-muted truncate">
                     {selectedSite.geologicalContext.period}
                   </span>
                 </div>
                 <div className="text-xs sm:text-sm font-hand font-bold text-park-ink truncate">
                   {activeFossil ? activeFossil.specimenTitle : selectedSite.name}
                 </div>
                 <div className="text-[10px] font-rounded text-park-tree font-bold flex items-center gap-1 mt-0.5">
                   <span>Open Field Journal</span>
                   <ChevronRight size={11} />
                 </div>
               </div>

               {/* Prev/Next buttons */}
               <div className="flex items-center gap-1 shrink-0">
                 <button
                   onClick={(e) => { e.stopPropagation(); goToPrevSite(); }}
                   disabled={markers.length <= 1}
                   className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-700 active:scale-95 disabled:opacity-30"
                   title="Previous site"
                 >
                   <ChevronLeft size={16} />
                 </button>
                 <button
                   onClick={(e) => { e.stopPropagation(); goToNextSite(); }}
                   disabled={markers.length <= 1}
                   className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-700 active:scale-95 disabled:opacity-30"
                   title="Next site"
                 >
                   <ChevronRight size={16} />
                 </button>
               </div>
             </div>
           )}
        </main>

        {/* Right Sidebar: Nature Field Journal / Specimen Dossier */}
        <aside className={`w-full md:w-[470px] lg:w-[490px] xl:w-[520px] bg-[#faf8f3] flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10 overflow-hidden relative md:border-l border-park-card-border shrink-0 ${
          mobileTab === 'map' ? 'hidden md:flex' : 'flex flex-1'
        }`}>
          {selectedSite ? (
            <div className="flex flex-col h-full relative overflow-y-auto no-scrollbar p-3.5 sm:p-5 space-y-4 pb-28 md:pb-5">
              
              {/* Mobile Back to Map Navigation Bar */}
              <div className="md:hidden flex items-center justify-between pb-2 border-b border-park-card-border">
                <button
                  onClick={() => setMobileTab('map')}
                  className="px-3 py-1.5 bg-park-tree text-white rounded-xl text-xs font-rounded font-bold flex items-center gap-1.5 shadow-xs active:scale-95"
                >
                  <ChevronLeft size={14} />
                  <span>Explore Map</span>
                </button>
                <div className="text-right">
                  <span className="text-[11px] font-hand font-bold text-park-tree truncate block">
                    {activeFossil ? activeFossil.commonName : activeQuery}
                  </span>
                  <span className="text-[9px] font-rounded text-park-ink-muted truncate block max-w-[150px]">
                    {selectedSite.name}
                  </span>
                </div>
              </div>
              
              {/* Journal Top Header */}
              <div className="flex justify-between items-center pb-1">
                <span className="font-bold text-sm text-gray-800 tracking-tight flex items-center gap-1.5">
                  {activeFossil ? 'Fossil Collection Specimen' : 'Paleo Field Survey Record'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 group"
                    title="Export Field Documentation Report as PDF"
                  >
                    <Printer size={13} className="text-blue-600 group-hover:scale-110 transition-transform" />
                    <span>Export PDF</span>
                  </button>

                  {activeFossil && (
                    <span className="bg-amber-500/15 text-amber-800 border border-amber-400/60 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Species Name Hero Card */}
              <div className={`border-2 p-4 relative bg-white/90 rounded-2xl shadow-xs ${
                activeFossil ? 'border-amber-400/70 bg-gradient-to-br from-white to-amber-50/30' : 'border-park-border-green/40'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[9px] font-rounded font-bold text-park-ink-muted uppercase tracking-wider mb-1">
                      {activeFossil ? 'IDENTIFIED SPECIMEN & TAXON' : 'SPECIES TAXON / CLASSIFICATION'}
                    </div>
                    <div className="text-3xl font-hand font-bold text-park-tree pt-1 pb-1">
                      {activeFossil ? activeFossil.specimenTitle : activeQuery}
                    </div>
                    <div className="text-sm font-hand font-semibold text-park-ink-muted">
                      {activeQuery}
                    </div>
                  </div>

                  {activeFossil && (
                    <div className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-center shrink-0">
                      <div className="text-[9px] font-rounded font-bold uppercase text-amber-700">Match</div>
                      <div className="text-base font-hand font-bold text-amber-900 leading-none">
                        {activeFossil.confidenceScore}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-rounded text-park-ink-muted font-medium flex items-center gap-1.5 mt-2 pt-2 border-t border-dotted border-park-card-border">
                  <MapPin size={12} className={activeFossil ? 'text-amber-600' : 'text-park-accent-orange'} />
                  <span className="font-semibold text-park-ink">{selectedSite.name}</span>
                </div>
              </div>

              {/* Visual Showcase: Switch between Uploaded Fossil Photo & Living Creature Reconstruction */}
              <div className="p-3 bg-[#ffffff] rounded-2xl border border-park-card-border shadow-xs flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
                {/* Mode Selector Pill if user has uploaded a fossil photo */}
                {activeFossil && (
                  <div className="w-full flex justify-between items-center pb-2 mb-2 border-b border-park-card-border">
                    <div className="flex items-center gap-1 bg-park-card-muted/80 p-0.5 rounded-xl border border-park-card-border">
                      <button
                        onClick={() => setImageDisplayMode('fossil_photo')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-rounded font-bold transition-all ${
                          imageDisplayMode === 'fossil_photo'
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'text-park-ink-muted hover:text-park-ink'
                        }`}
                      >
                        Your Fossil Photo
                      </button>
                      <button
                        onClick={() => setImageDisplayMode('reconstruction')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-rounded font-bold transition-all ${
                          imageDisplayMode === 'reconstruction'
                            ? 'bg-park-tree text-white shadow-2xs'
                            : 'text-park-ink-muted hover:text-park-ink'
                        }`}
                      >
                        Living Reconstruction
                      </button>
                    </div>

                    {imageDisplayMode === 'fossil_photo' && (
                      <button
                        onClick={() => setEnlargedPhotoUrl(activeFossil.userPhotoUrl)}
                        className="text-[10px] font-rounded font-bold text-park-tree hover:text-amber-700 flex items-center gap-1"
                        title="View Full Resolution"
                      >
                        <Maximize2 size={12} /> Inspect Photo
                      </button>
                    )}
                  </div>
                )}

                {/* Display Area */}
                {imageDisplayMode === 'fossil_photo' && activeFossil ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center py-1">
                    <div 
                      onClick={() => setEnlargedPhotoUrl(activeFossil.userPhotoUrl)}
                      className="cursor-zoom-in group/img relative max-h-72 w-full flex items-center justify-center bg-[#faf8f3] rounded-xl overflow-hidden p-2 border border-park-card-border/60"
                    >
                      <img 
                        src={activeFossil.userPhotoUrl} 
                        alt={activeFossil.specimenTitle}
                        className="max-h-64 max-w-full object-contain rounded-lg shadow-sm" 
                      />
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white p-1.5 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <Maximize2 size={14} />
                      </div>
                    </div>
                    {activeFossil.userNotes && (
                      <div className="w-full mt-2 p-2 bg-amber-50/60 border border-amber-200/60 rounded-xl text-[10px] font-rounded text-amber-900 flex items-start gap-1.5">
                        <Tag size={12} className="shrink-0 mt-0.5 text-amber-700" />
                        <span><strong>Collector Note:</strong> {activeFossil.userNotes}</span>
                      </div>
                    )}
                  </div>
                ) : imgLoading ? (
                  <div className="flex flex-col items-center gap-2 py-12">
                      <Loader2 className="animate-spin text-park-accent-green" size={28} />
                      <span className="text-[11px] font-rounded font-bold text-park-ink-muted animate-pulse">
                        Generating paleontological reconstruction...
                      </span>
                  </div>
                ) : imgError ? (
                  <div className="flex flex-col items-center gap-2 p-6 text-center">
                    <AlertCircle size={24} className="text-rose-500" />
                    <div className="text-[11px] font-rounded font-bold text-rose-700">
                      Illustration generation limit reached
                    </div>
                    <button 
                      onClick={() => {
                          currentBlueprintTaxa.current = null;
                          updateBlueprint(activeQuery);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-park-card-muted border border-park-card-border rounded-xl text-[11px] font-rounded font-bold text-park-tree hover:bg-park-land/20 transition-colors"
                    >
                      <RotateCcw size={13} /> Retry Reconstruction
                    </button>
                  </div>
                ) : blueprintImage ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-[#ffffff] rounded-xl overflow-hidden py-1">
                    <img 
                      src={blueprintImage} 
                      alt={`${activeQuery} illustration`}
                      className="max-h-72 w-full object-contain rounded-xl bg-[#ffffff]" 
                    />
                  </div>
                ) : (
                  <div className="text-[11px] font-rounded text-park-ink-muted py-12 font-semibold">
                    Awaiting Field Reconstruction...
                  </div>
                )}
              </div>

              {/* Expedition Info Boards */}
              <div className="space-y-3">
                {/* Board 1: Origin Formation Coordinates */}
                <div className={`rounded-2xl border p-4 flex flex-col justify-between relative shadow-xs transition-colors ${
                  activeFossil ? 'bg-amber-50/40 border-amber-300' : 'bg-white/95 border-park-card-border'
                }`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className={sectionLabelStyle}>
                      {activeFossil ? 'SPECIMEN ORIGIN • STRATIGRAPHIC LAYER' : 'TAXA DENSITY • DISTRIBUTION'}
                    </span>
                    {activeFossil && (
                      <span className="text-[10px] font-mono text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                        {activeFossil.primaryFormation.coordinates.lat.toFixed(3)}°N, {activeFossil.primaryFormation.coordinates.lng.toFixed(3)}°E
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-hand font-bold text-park-tree">
                        {activeFossil ? activeFossil.primaryFormation.name : markers.length}
                      </span>
                      <span className="text-xs font-rounded font-bold text-park-ink-muted">
                        {activeFossil ? `(${activeFossil.primaryFormation.country})` : 'Confirmed Fossil Sites'}
                      </span>
                    </div>
                    {activeFossil && (
                      <p className="text-[11px] font-rounded text-park-ink-muted mt-1 leading-snug">
                        {activeFossil.primaryFormation.environment}
                      </p>
                    )}
                  </div>
                </div>

                {/* Board 2: Bio Signatures & Geological Context */}
                <div className="bg-white/95 rounded-2xl border border-park-card-border p-4 flex flex-col justify-between relative shadow-xs group hover:border-park-border-green/60 transition-colors">
                  <div className="mb-2">
                    <span className={sectionLabelStyle}>
                      BIO SIGNATURES • GEOLOGICAL AGE
                    </span>
                  </div>

                  <div className="space-y-1.5 my-auto text-xs">
                    <div className="flex justify-between items-center font-rounded border-b border-dotted border-park-card-border pb-1">
                      <span className="text-park-ink-muted font-medium">Epoch / Era:</span>
                      <span className="font-bold text-park-ink bg-park-sand/70 px-2 py-0.5 rounded-md border border-park-card-border text-[11px]">
                        {selectedSite?.geologicalContext.era || 'MESOZOIC'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-rounded border-b border-dotted border-park-card-border pb-1">
                      <span className="text-park-ink-muted font-medium">Period:</span>
                      <span className="font-bold text-park-ink bg-park-sand/70 px-2 py-0.5 rounded-md border border-park-card-border text-[11px]">
                        {selectedSite?.geologicalContext.period || 'LATE CRETACEOUS'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-rounded border-b border-dotted border-park-card-border pb-1">
                      <span className="text-park-ink-muted font-medium">Deposition Climate:</span>
                      <span className="font-bold text-park-ink bg-park-sand/70 px-2 py-0.5 rounded-md border border-park-card-border text-[11px]">
                        {selectedSite?.geologicalContext.climate || 'SUBTROPICAL'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-rounded">
                      <span className="text-park-ink-muted font-medium">Geological Dating:</span>
                      <span className="font-bold text-park-ink bg-park-sand/70 px-2 py-0.5 rounded-md border border-park-card-border text-[11px]">
                        {selectedSite?.geologicalContext.age || '68-66 Ma'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Selector Buttons */}
              <div className="flex justify-start gap-1.5 bg-park-card-muted/80 p-1 rounded-2xl border border-park-card-border">
                {activeFossil && (
                  <button
                    onClick={() => setActiveTab('fossil')}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-rounded font-extrabold transition-all text-center flex items-center justify-center gap-1 ${
                      activeTab === 'fossil'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-amber-800 hover:text-amber-950 hover:bg-amber-100/50'
                    }`}
                  >
                    <Sparkles size={12} />
                    <span>Fossil Lab</span>
                  </button>
                )}

                {(['overview', 'inventory', 'metrics'] as TabType[]).map((tab) => {
                  const tabLabels: Record<TabType, string> = {
                    fossil: 'Fossil Lab',
                    overview: 'Overview',
                    inventory: 'Inventory',
                    metrics: 'Metrics'
                  };

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-rounded font-bold transition-all text-center ${
                        activeTab === tab 
                          ? 'bg-white text-park-tree shadow-xs border border-park-card-border' 
                          : 'text-park-ink-muted hover:text-park-ink'
                      }`}
                    >
                      {tabLabels[tab]}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Container */}
              <div className="border-t border-park-card-border pt-2">
                
                {/* FOSSIL ANALYSIS TAB (Active when user uploads a fossil photo) */}
                {activeTab === 'fossil' && activeFossil && (
                  <div className="animate-in space-y-4">
                    {/* Diagnostic Summary */}
                    <div className="p-4 bg-gradient-to-br from-white to-amber-50/50 rounded-2xl border border-amber-300 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <div className="flex items-center gap-2">
                          <Bone size={16} className="text-amber-700" />
                          <h4 className="text-xs font-rounded font-extrabold text-park-tree">
                            Anatomical Element Identified
                          </h4>
                        </div>
                        <span className="text-[10px] font-rounded font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-300">
                          {activeFossil.fossilCategory}
                        </span>
                      </div>

                      <p className="text-[13px] font-hand font-bold text-park-ink leading-relaxed">
                        {activeFossil.elementIdentified}
                      </p>

                      <p className="text-[11px] font-rounded text-park-ink/80 leading-relaxed">
                        {activeFossil.scientificDescription}
                      </p>
                    </div>

                    {/* Visual Diagnostic Clues Spotted by Gemini Vision */}
                    <div className="p-4 bg-white rounded-2xl border border-park-card-border shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2 pb-1 border-b border-park-card-border">
                        <Eye size={15} className="text-park-tree" />
                        <h4 className="text-xs font-rounded font-bold text-park-tree">
                          Visual Diagnostic Traits Observed in Photo
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {activeFossil.visualObservations.map((observation, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs font-rounded">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-amber-300">
                              {i + 1}
                            </span>
                            <span className="text-park-ink/90 leading-snug">
                              {observation}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preservation Grade & Collector Care Guide */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-white rounded-2xl border border-park-card-border shadow-xs">
                        <div className="flex items-center gap-1.5 text-park-tree font-bold text-[11px] font-rounded mb-1">
                          <Award size={13} className="text-amber-600" />
                          <span>Preservation Quality</span>
                        </div>
                        <p className="text-[11px] font-rounded text-park-ink/80 leading-relaxed">
                          {activeFossil.preservationQuality}
                        </p>
                      </div>

                      <div className="p-3.5 bg-white rounded-2xl border border-park-card-border shadow-xs">
                        <div className="flex items-center gap-1.5 text-park-tree font-bold text-[11px] font-rounded mb-1">
                          <ShieldCheck size={13} className="text-emerald-600" />
                          <span>Collector Storage Tips</span>
                        </div>
                        <p className="text-[11px] font-rounded text-park-ink/80 leading-relaxed">
                          {activeFossil.collectorCareGuide}
                        </p>
                      </div>
                    </div>

                    {/* Global Formations Where This Fossil Occurs */}
                    {activeFossil.alternativeSites?.length > 0 && (
                      <div className="p-3.5 bg-park-card-muted/60 rounded-2xl border border-park-card-border">
                        <p className="text-[10px] font-rounded font-bold text-park-ink-muted uppercase mb-1.5">
                          Other Confirmed Global Localities:
                        </p>
                        <div className="space-y-1.5">
                          {activeFossil.alternativeSites.map((site, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[11px] font-rounded">
                              <span className="font-semibold text-park-ink">
                                • {site.name} ({site.country})
                              </span>
                              <span className="text-[10px] font-mono text-park-ink-muted">
                                {site.notes}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Export Action Card */}
                    <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-200 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-blue-900">Field Documentation Dossier</div>
                        <div className="text-[10px] text-blue-700">Export this specimen as an official PDF report & field log</div>
                      </div>
                      <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 shrink-0"
                      >
                        <Printer size={13} />
                        <span>Export PDF</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="animate-in space-y-4">
                    {/* Chronological Geological Timeline Infographic */}
                    <GeologicalTimeline
                      selectedSite={selectedSite}
                      activeFossil={activeFossil}
                      activeTaxaName={activeQuery}
                    />

                    {/* Site Discovery Summary */}
                    <div className="p-4 bg-white rounded-2xl border border-park-card-border shadow-xs">
                      <div className="mb-2">
                        <h4 className="text-[13px] font-rounded font-extrabold text-park-tree">
                          {selectedSite.name}
                        </h4>
                      </div>
                      <p className="text-[12px] font-rounded leading-relaxed text-park-ink/90">
                        {selectedSite.summary}
                      </p>
                    </div>

                    {/* Geological Specs Tiles */}
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 bg-white rounded-2xl border border-park-card-border shadow-xs">
                          <p className="text-[9px] font-rounded font-bold text-park-ink-muted uppercase">Period Index</p>
                          <p className="text-[12px] font-rounded font-bold text-park-tree mt-0.5">{selectedSite.geologicalContext.period}</p>
                       </div>
                       <div className="p-3 bg-white rounded-2xl border border-park-card-border shadow-xs">
                          <p className="text-[9px] font-rounded font-bold text-park-ink-muted uppercase">Climate Vector</p>
                          <p className="text-[12px] font-rounded font-bold text-park-tree mt-0.5">{selectedSite.geologicalContext.climate}</p>
                       </div>
                    </div>

                    {/* Export Action Banner */}
                    <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-200 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-blue-900">Site Survey Dossier</div>
                        <div className="text-[10px] text-blue-700">Export field summary as a printable PDF report</div>
                      </div>
                      <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 shrink-0"
                      >
                        <Printer size={13} />
                        <span>Export PDF</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* INVENTORY TAB */}
                {activeTab === 'inventory' && (
                  <div className="animate-in space-y-3.5">
                    {/* Sub-view Segmented Toggle */}
                    <div className="flex p-1 bg-park-sand/70 rounded-xl border border-park-card-border">
                      <button
                        onClick={() => setInventorySubView('comparator')}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          inventorySubView === 'comparator'
                            ? 'bg-white text-park-tree shadow-xs'
                            : 'text-park-ink-muted hover:text-park-ink'
                        }`}
                      >
                        <ArrowLeftRight size={13} />
                        <span>Specimen Comparator</span>
                      </button>

                      <button
                        onClick={() => setInventorySubView('stratum')}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          inventorySubView === 'stratum'
                            ? 'bg-white text-park-tree shadow-xs'
                            : 'text-park-ink-muted hover:text-park-ink'
                        }`}
                      >
                        <Layers size={13} />
                        <span>Stratum Inventory ({selectedSite.features.length})</span>
                      </button>
                    </div>

                    {/* VIEW 1: Specimen Comparator */}
                    {inventorySubView === 'comparator' && (
                      <SpecimenComparator
                        userCollection={fossilCollection}
                        activeFossil={activeFossil}
                        onSelectSpecimen={handleSelectSavedFossil}
                        onOpenUploadModal={() => setIsUploadModalOpen(true)}
                      />
                    )}

                    {/* VIEW 2: Recovered Specimens / Stratum Features */}
                    {inventorySubView === 'stratum' && (
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-[10px] font-rounded font-bold text-park-ink-muted px-1">
                          <span>RECOVERED SPECIMENS • TAXA STRATUM</span>
                          <span>RECORD #</span>
                        </div>

                        {selectedSite.features.map((feature, i) => (
                          <div 
                            key={i} 
                            className="p-3 bg-white rounded-2xl border border-park-card-border shadow-xs hover:border-park-border-green/60 transition-colors flex items-start justify-between gap-3"
                          >
                            <div className="flex-1">
                               <div className="flex items-center gap-2 mb-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-park-accent-green"></span>
                                 <h4 className="text-[12px] font-rounded font-bold text-park-tree">{feature.name}</h4>
                               </div>
                               <p className="text-[11px] font-rounded text-park-ink-muted leading-snug">{feature.description}</p>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-park-ink-muted bg-park-sand/80 px-2 py-0.5 rounded-md border border-park-card-border shrink-0">
                              {1990 + i * 2}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* METRICS TAB */}
                {activeTab === 'metrics' && (
                  <div className="animate-in space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-park-card-border shadow-xs space-y-3">
                      <h3 className="text-[13px] font-rounded font-bold text-park-tree border-b border-park-card-border pb-2 flex items-center justify-between">
                        <span>Vital Statistics • Specimen Metrics</span>
                        <Sparkles size={14} className="text-park-accent-yellow" />
                      </h3>

                      <div className="flex flex-col gap-2.5">
                        {selectedSite.stats.map((stat, i) => (
                          <div key={i} className="flex justify-between items-baseline group">
                            <span className="text-[11px] font-rounded font-semibold text-park-ink-muted group-hover:text-park-ink transition-colors">
                              {stat.label}
                            </span>
                            <div className="flex-1 border-b border-dotted border-park-card-border mx-2 mb-1"></div>
                            <span className="text-[12px] font-rounded font-extrabold text-park-tree text-right bg-park-sand/40 px-2 py-0.5 rounded-md border border-park-card-border/60">
                              {stat.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-3.5 bg-park-sand/40 border border-park-card-border rounded-2xl">
                      <p className="text-[9px] font-rounded font-bold text-park-ink-muted uppercase mb-1">Field Note:</p>
                      <p className="text-[10px] font-rounded text-park-ink-muted leading-relaxed">
                        Data retrieved from authenticated paleontological fossil databases and verified through Gemini field visual analysis.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
               <Loader2 size={48} className="text-park-tree mb-4 animate-spin opacity-80" />
               <h3 className="text-2xl font-hand font-bold text-park-tree mb-1">Surveying Global Sites</h3>
               <p className="text-[10px] font-rounded mt-1.5 text-park-ink-muted">Accessing satellite geological data...</p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
               <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-700 shadow-md p-2">
                 <DinoIcon className="w-14 h-14 fill-amber-700" />
               </div>

               <div>
                 <h3 className="text-[34px] sm:text-[38px] leading-tight font-hand font-bold text-park-tree mb-2">
                   Welcome to Oleg's Fossil Collection
                 </h3>
                 <p className="text-sm font-rounded text-park-ink-muted leading-relaxed max-w-sm mx-auto">
                   Explore prehistoric life on an interactive global expedition map or upload a photo from your own fossil collection!
                 </p>
               </div>

               {/* Dual Action Cards */}
               <div className="w-full space-y-3 max-w-sm">
                 <button
                   onClick={() => setIsUploadModalOpen(true)}
                   className="w-full p-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl text-left shadow-md hover:shadow-lg transition-all flex items-center justify-between group"
                 >
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                       <Upload size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                     </div>
                     <div>
                       <div className="font-rounded font-extrabold text-sm">Upload Fossil Photo</div>
                       <div className="text-[11px] text-amber-100">Describe specimen & find where it was found</div>
                     </div>
                   </div>
                   <ChevronRight size={18} className="text-white/80 group-hover:translate-x-1 transition-transform" />
                 </button>

                 <div className="text-[11px] font-rounded text-park-ink-muted/80 uppercase tracking-widest font-extrabold">
                   Or Pick a Dinosaur from the Top Bar
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                   {TAXA.slice(0, 4).map((taxa) => (
                     <button
                       key={taxa}
                       onClick={() => handleQuerySelect(taxa)}
                       className="p-2.5 bg-white border border-park-card-border rounded-xl text-left hover:border-park-tree hover:bg-park-card-muted text-xs font-rounded font-bold text-park-tree transition-colors truncate flex items-center gap-1.5"
                     >
                       <DinoIcon className="w-3.5 h-3.5 fill-park-tree shrink-0" />
                       <span className="truncate">{taxa}</span>
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile Floating Bottom Navigation Bar (Visible on mobile screens) */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-sm bg-[#faf8f2]/95 backdrop-blur-md border border-[#c4b59d] rounded-full p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.18)] flex items-center justify-between">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 px-2.5 rounded-full text-xs font-rounded font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === 'map'
              ? 'bg-park-tree text-white shadow-xs'
              : 'text-park-ink-muted hover:text-park-ink'
          }`}
        >
          <MapIcon size={14} />
          <span>Fossil Map</span>
        </button>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="mx-1 px-3.5 py-2 rounded-full text-xs font-rounded font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs flex items-center justify-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
        >
          <Camera size={13} />
          <span>Scan</span>
        </button>

        <button
          onClick={() => setMobileTab('journal')}
          className={`flex-1 py-2 px-2.5 rounded-full text-xs font-rounded font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === 'journal'
              ? 'bg-park-tree text-white shadow-xs'
              : 'text-park-ink-muted hover:text-park-ink'
          }`}
        >
          <FileText size={14} />
          <span>Dossier</span>
          {activeFossil && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          )}
        </button>
      </nav>

      {/* Fossil Upload Modal */}
      <FossilUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFossilIdentified={handleFossilIdentified}
      />

      {/* Full Photo Inspection Modal */}
      {enlargedPhotoUrl && (
        <div 
          onClick={() => setEnlargedPhotoUrl(null)}
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-6 cursor-zoom-out animate-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-transparent flex flex-col items-center">
            <button
              onClick={() => setEnlargedPhotoUrl(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white flex items-center gap-1.5 text-xs font-rounded font-bold bg-white/10 px-3 py-1.5 rounded-full"
            >
              <X size={16} /> Close Preview
            </button>
            <img 
              src={enlargedPhotoUrl} 
              alt="Enlarged fossil specimen" 
              className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl border-2 border-white/20 bg-black/40"
            />
            {activeFossil && (
              <div className="mt-3 text-center text-white/90 font-rounded text-xs bg-black/50 px-4 py-1.5 rounded-full">
                <strong>{activeFossil.specimenTitle}</strong> • {activeFossil.primaryFormation.name} ({activeFossil.primaryFormation.country})
              </div>
            )}
          </div>
        </div>
      )}

      {/* Field Documentation & Specimen Dossier Export Modal */}
      <FieldReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        selectedSite={selectedSite}
        activeFossil={activeFossil}
        activeQuery={activeQuery}
        blueprintImage={blueprintImage}
        currentMarker={markers[currentIndex]}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default App;
