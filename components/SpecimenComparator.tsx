import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Layers, 
  Clock, 
  MapPin, 
  Award, 
  Sparkles, 
  ExternalLink, 
  ChevronDown, 
  Check, 
  Upload, 
  ShieldCheck,
  Flame,
  Info,
  Compass
} from 'lucide-react';
import { FossilAnalysisResult } from '../types';

interface SpecimenComparatorProps {
  userCollection: FossilAnalysisResult[];
  activeFossil: FossilAnalysisResult | null;
  onSelectSpecimen: (fossil: FossilAnalysisResult) => void;
  onOpenUploadModal: () => void;
}

// Curated reference museum specimens covering major eras and diverse anatomical elements
const CURATED_REFERENCE_SPECIMENS: FossilAnalysisResult[] = [
  {
    id: 'ref-trex-tooth',
    specimenTitle: 'Tyrannosaurus rex Premaxillary Tooth',
    taxaName: 'Tyrannosaurus rex',
    commonName: 'T-Rex',
    elementIdentified: 'Serrated Premaxillary Tooth with D-shaped Cross Section',
    confidenceScore: 98,
    confidenceLevel: 'High',
    fossilCategory: 'Vertebrate Dentition (Carnassial)',
    visualObservations: [
      'Dense serrations (denticles) along anterior and posterior carinae (approx. 2 per mm)',
      'Thick enamel rind with deep dark-brown iron oxide mineralization',
      'Robust conical root base adapted for heavy bone-crushing biomechanics'
    ],
    scientificDescription: 'Heavy-gauge premaxillary tooth from an adult Tyrannosaurus rex. Unlike blade-like theropod teeth, tyrannosaurid dentition is thickened to withstand lateral torsional stresses during osteophagy (bone-crushing bite forces exceeding 35,000 N).',
    estimatedAge: '68 - 66 Million Years Ago',
    geologicalPeriod: 'Late Cretaceous (Maastrichtian)',
    geologicalEra: 'Mesozoic',
    primaryFormation: {
      name: 'Hell Creek Formation',
      locationName: 'Garfield County, Montana',
      country: 'USA',
      coordinates: { lat: 47.35, lng: -106.91 },
      environment: 'Meandering river channels, backswamps, and humid subtropical coastal plains',
      age: '66 - 68 Ma'
    },
    alternativeSites: [
      { name: 'Lance Formation', country: 'USA', coordinates: { lat: 43.1, lng: -104.4 }, notes: 'Contemporaneous fluvial sediments' },
      { name: 'Scollard Formation', country: 'Canada', coordinates: { lat: 51.9, lng: -112.7 }, notes: 'Late Cretaceous northern range' }
    ],
    preservationQuality: 'Grade A — Exceptional enamel preservation with intact serrated carinae',
    collectorCareGuide: 'Store in padded archival specimen box with relative humidity maintained below 50% to prevent pyrite decay.',
    userPhotoUrl: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=600&q=80',
    timestamp: Date.now() - 86400000 * 5
  },
  {
    id: 'ref-allosaurus-claw',
    specimenTitle: 'Allosaurus fragilis Raptorial Hand Claw (Ungual I)',
    taxaName: 'Allosaurus fragilis',
    commonName: 'Allosaurus',
    elementIdentified: 'Manual Ungual Phalange (Digit I Raptorial Hand Claw)',
    confidenceScore: 95,
    confidenceLevel: 'High',
    fossilCategory: 'Appendicular Skeletal Element (Forelimb Claws)',
    visualObservations: [
      'Hyper-recurved sickle profile with lateral vascular neurovascular grooves',
      'Prominent flexor tubercle at the proximoventral base for powerful tendon attachment',
      'Dark charcoal-grey siliceous permineralization typical of Morrison siltstone matrix'
    ],
    scientificDescription: 'Fossilized manual ungual from the first digit (thumb) of Allosaurus fragilis. The forelimbs carried massive, deeply curved claws specialized for latching onto subadult sauropods and ornithischians.',
    estimatedAge: '155 - 150 Million Years Ago',
    geologicalPeriod: 'Late Jurassic (Kimmeridgian - Tithonian)',
    geologicalEra: 'Mesozoic',
    primaryFormation: {
      name: 'Morrison Formation (Cleveland-Lloyd Quarry)',
      locationName: 'Emery County, Utah',
      country: 'USA',
      coordinates: { lat: 39.32, lng: -110.69 },
      environment: 'Semi-arid floodplain basin with seasonal mudflat waterholes and braided river channels',
      age: '150 - 155 Ma'
    },
    alternativeSites: [
      { name: 'Dinosaur National Monument', country: 'USA', coordinates: { lat: 40.44, lng: -109.30 }, notes: 'Abundant Morrison theropod bonebeds' },
      { name: 'Lourinhã Formation', country: 'Portugal', coordinates: { lat: 39.24, lng: -9.31 }, notes: 'Iberian Jurassic coastal deposits' }
    ],
    preservationQuality: 'Grade A- — Excellent surface cortical bone texture with minor apical abrasion',
    collectorCareGuide: 'Stabilize micro-fissures using archival Paraloid B-72 copolymer solution in acetone. Keep away from thermal cycling.',
    userPhotoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    timestamp: Date.now() - 86400000 * 12
  },
  {
    id: 'ref-triceratops-horn',
    specimenTitle: 'Triceratops horridus Postorbital Horn Core',
    taxaName: 'Triceratops horridus',
    commonName: 'Triceratops',
    elementIdentified: 'Postorbital Supraorbital Brow Horn Core Section',
    confidenceScore: 96,
    confidenceLevel: 'High',
    fossilCategory: 'Cranial Ornamental Skeletal Element',
    visualObservations: [
      'Longitudinal vascular grooves indicating thick keratinous sheath coverage in life',
      'Dense trabecular spongiosa interior surrounded by a solid compact bone outer wall',
      'Distinct forward-curving curvature diagnostic of ceratopsid supraorbital weapons'
    ],
    scientificDescription: 'Mid-section segment of a postorbital brow horn core of Triceratops horridus. Horn cores served multifunctional evolutionary purposes: intraspecific combat, anti-predator defense against Tyrannosaurus rex, and socio-sexual display.',
    estimatedAge: '68 - 66 Million Years Ago',
    geologicalPeriod: 'Late Cretaceous (Maastrichtian)',
    geologicalEra: 'Mesozoic',
    primaryFormation: {
      name: 'Hell Creek Formation',
      locationName: 'Slope County, North Dakota',
      country: 'USA',
      coordinates: { lat: 46.43, lng: -103.45 },
      environment: 'Warm temperate river floodplain with angiosperm and palm forest cover',
      age: '66 - 67 Ma'
    },
    alternativeSites: [
      { name: 'Frenchman Formation', country: 'Canada', coordinates: { lat: 49.2, lng: -108.6 }, notes: 'Uppermost Cretaceous strata' },
      { name: 'Denver Formation', country: 'USA', coordinates: { lat: 39.7, lng: -104.9 }, notes: 'Front Range synorogenic sediment' }
    ],
    preservationQuality: 'Grade B+ — Solid internal mineral consolidation; external surface exhibits authentic field weathering patina',
    collectorCareGuide: 'Cradle on custom polyurethane foam mount to distribute weight evenly and prevent pressure fractures.',
    userPhotoUrl: 'https://images.unsplash.com/photo-1569420066847-f3162b7be887?auto=format&fit=crop&w=600&q=80',
    timestamp: Date.now() - 86400000 * 20
  },
  {
    id: 'ref-spino-spine',
    specimenTitle: 'Spinosaurus aegyptianus Neural Spine & Rostral Tooth',
    taxaName: 'Spinosaurus aegyptianus',
    commonName: 'Spinosaurus',
    elementIdentified: 'Hyper-elongated Dorsal Vertebra Neural Spine & Rostral Tooth',
    confidenceScore: 94,
    confidenceLevel: 'High',
    fossilCategory: 'Axial Skeleton (Dorsal Sail Spine)',
    visualObservations: [
      'Fluted conical tooth crown without serrations, adapted for capturing slippery aquatic fish prey',
      'Thickened cortical bone on dorsal neural process with osteosclerotic bone density',
      'Distinctive reddish-pink iron-rich Kem Kem sandstone sedimentary patina'
    ],
    scientificDescription: 'Diagnostic anatomical elements from Spinosaurus aegyptianus, the largest semi-aquatic predatory dinosaur known. The tall neural spines supported a dorsal sail or fat-storage hump, while dense osteosclerotic bones assisted in diving ballast.',
    estimatedAge: '100 - 94 Million Years Ago',
    geologicalPeriod: 'Late Cretaceous (Cenomanian)',
    geologicalEra: 'Mesozoic',
    primaryFormation: {
      name: 'Kem Kem Beds',
      locationName: 'Tafilalt Region, Erg Chebbi',
      country: 'Morocco',
      coordinates: { lat: 31.22, lng: -4.01 },
      environment: 'Vast deltaic coastal mangrove system, tidal estuaries, and giant river channels',
      age: '95 - 100 Ma'
    },
    alternativeSites: [
      { name: 'Bahariya Formation', country: 'Egypt', coordinates: { lat: 28.35, lng: 28.85 }, notes: 'Type locality discovered by Ernst Stromer' }
    ],
    preservationQuality: 'Grade A — Pristine uncrushed cylindrical tooth crown with fine vertical striations',
    collectorCareGuide: 'Avoid moisture exposure. Fragile Kem Kem matrix easily hydrates; store in a dry climate-controlled display.',
    userPhotoUrl: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=600&q=80',
    timestamp: Date.now() - 86400000 * 30
  },
  {
    id: 'ref-coelo-vert',
    specimenTitle: 'Coelophysis bauri Cervical Vertebra & Hollow Bone Core',
    taxaName: 'Coelophysis bauri',
    commonName: 'Coelophysis',
    elementIdentified: 'Pneumatic Cervical Vertebra & Hollow Thin-walled Femur Shaft',
    confidenceScore: 92,
    confidenceLevel: 'High',
    fossilCategory: 'Early Theropod Axial Skeleton',
    visualObservations: [
      'Extremely thin cortical bone wall with hollow center (hollow bone design / pneumatization)',
      'Elongated amphicoelous vertebral centrum with delicate neural arch facets',
      'Brick-red siltstone matrix characteristic of the Petrified Forest Member'
    ],
    scientificDescription: 'Cervical vertebra and associated hollow limb shaft of Coelophysis bauri, one of the earliest known agile theropod dinosaurs. Demonstrates the early Triassic origin of hollow, lightweight bones that later facilitated avian flight.',
    estimatedAge: '215 - 208 Million Years Ago',
    geologicalPeriod: 'Late Triassic (Norian)',
    geologicalEra: 'Mesozoic',
    primaryFormation: {
      name: 'Chinle Formation (Ghost Ranch)',
      locationName: 'Rio Arriba County, New Mexico',
      country: 'USA',
      coordinates: { lat: 36.33, lng: -106.47 },
      environment: 'Monsoonal seasonal river floodplains, oxbow lakes, and conifer woodlands',
      age: '208 - 215 Ma'
    },
    alternativeSites: [
      { name: 'Ischigualasto Formation', country: 'Argentina', coordinates: { lat: -30.1, lng: -67.8 }, notes: 'Carnian early dinosaur radiation' }
    ],
    preservationQuality: 'Grade B — Fragile hollow skeletal element protected within supportive matrix jacket',
    collectorCareGuide: 'Never pick up by the delicate neural spine. Support using contoured sandbags or silicone display cradles.',
    userPhotoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    timestamp: Date.now() - 86400000 * 45
  }
];

export const SpecimenComparator: React.FC<SpecimenComparatorProps> = ({
  userCollection,
  activeFossil,
  onSelectSpecimen,
  onOpenUploadModal
}) => {
  // Merge user's collection with reference specimens
  const allAvailableSpecimens = useMemo(() => {
    // User specimens first, then reference specimens (avoiding ID collisions)
    const userIds = new Set(userCollection.map(f => f.id));
    const uniqueRefs = CURATED_REFERENCE_SPECIMENS.filter(ref => !userIds.has(ref.id));
    return [...userCollection, ...uniqueRefs];
  }, [userCollection]);

  // Selected specimen state (Specimen A and Specimen B)
  const [selectedIdA, setSelectedIdA] = useState<string>(() => {
    if (activeFossil) return activeFossil.id;
    if (userCollection.length > 0) return userCollection[0].id;
    return CURATED_REFERENCE_SPECIMENS[0].id;
  });

  const [selectedIdB, setSelectedIdB] = useState<string>(() => {
    if (userCollection.length > 1) return userCollection[1].id;
    return CURATED_REFERENCE_SPECIMENS[1].id;
  });

  // Keep selectedIdA in sync if activeFossil changes
  React.useEffect(() => {
    if (activeFossil && activeFossil.id !== selectedIdA && activeFossil.id !== selectedIdB) {
      setSelectedIdA(activeFossil.id);
    }
  }, [activeFossil]);

  // Retrieve full objects
  const specimenA = useMemo(() => {
    return allAvailableSpecimens.find(s => s.id === selectedIdA) || allAvailableSpecimens[0];
  }, [allAvailableSpecimens, selectedIdA]);

  const specimenB = useMemo(() => {
    return allAvailableSpecimens.find(s => s.id === selectedIdB) || (allAvailableSpecimens[1] || allAvailableSpecimens[0]);
  }, [allAvailableSpecimens, selectedIdB]);

  // Swap specimen positions
  const handleSwap = () => {
    const temp = selectedIdA;
    setSelectedIdA(selectedIdB);
    setSelectedIdB(temp);
  };

  // Helper to extract numeric age in Ma for temporal calculation
  const getNumericAge = (fossil: FossilAnalysisResult): number => {
    const text = fossil.estimatedAge || fossil.geologicalPeriod || '';
    const matches = text.match(/(\d+(?:\.\d+)?)/g);
    if (matches && matches.length >= 2) {
      return (parseFloat(matches[0]) + parseFloat(matches[1])) / 2;
    }
    if (matches && matches.length === 1) {
      return parseFloat(matches[0]);
    }
    const taxa = fossil.taxaName.toLowerCase();
    if (taxa.includes('trex') || taxa.includes('tyranno') || taxa.includes('triceratops')) return 67;
    if (taxa.includes('spino')) return 97;
    if (taxa.includes('allosaur') || taxa.includes('stego') || taxa.includes('brachio')) return 152;
    if (taxa.includes('coelo')) return 212;
    return 80;
  };

  const ageA = getNumericAge(specimenA);
  const ageB = getNumericAge(specimenB);
  const temporalDiff = Math.abs(ageA - ageB);

  // Period styling helper
  const getPeriodBadge = (periodStr: string) => {
    const lower = periodStr.toLowerCase();
    if (lower.includes('triassic')) {
      return {
        bg: 'bg-purple-100 text-purple-800 border-purple-300',
        dot: 'bg-purple-600',
        name: 'Triassic Period'
      };
    }
    if (lower.includes('jurassic')) {
      return {
        bg: 'bg-sky-100 text-sky-800 border-sky-300',
        dot: 'bg-sky-600',
        name: 'Jurassic Period'
      };
    }
    return {
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      dot: 'bg-emerald-600',
      name: 'Cretaceous Period'
    };
  };

  const periodBadgeA = getPeriodBadge(specimenA.geologicalPeriod);
  const periodBadgeB = getPeriodBadge(specimenB.geologicalPeriod);

  const isUserSpecimen = (id: string) => userCollection.some(u => u.id === id);

  return (
    <div className="space-y-4">
      {/* Comparator Top Header Banner */}
      <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <ArrowLeftRight size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 leading-none">
              <span>Specimen Comparator</span>
              <span className="text-[10px] font-mono bg-emerald-100/90 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300">
                Side-by-Side Analysis
              </span>
            </h3>
            <p className="text-[11px] text-emerald-800/80 mt-0.5 font-medium">
              Compare anatomical elements, geological eras, and stratigraphic horizons
            </p>
          </div>
        </div>

        <button
          onClick={handleSwap}
          className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 ml-auto"
          title="Swap Specimen Positions"
        >
          <ArrowLeftRight size={12} />
          <span>Swap (A ⇄ B)</span>
        </button>
      </div>

      {/* Selectors for Specimen A and Specimen B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* SPECIMEN A SELECTOR */}
        <div className="p-3 bg-white rounded-2xl border-2 border-emerald-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                A
              </span>
              <span>Primary Specimen</span>
            </span>
            {isUserSpecimen(specimenA.id) && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                ★ Your Upload
              </span>
            )}
          </div>

          <div className="relative">
            <select
              value={selectedIdA}
              onChange={(e) => setSelectedIdA(e.target.value)}
              className="w-full text-xs font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-2 appearance-none focus:outline-none focus:border-emerald-500 pr-8"
            >
              {userCollection.length > 0 && (
                <optgroup label="📂 Your Uploaded Collection">
                  {userCollection.map(f => (
                    <option key={`a-${f.id}`} value={f.id}>
                      ★ {f.specimenTitle} ({f.geologicalPeriod})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="🏛️ Curated Museum Reference Specimens">
                {CURATED_REFERENCE_SPECIMENS.map(ref => (
                  <option key={`a-${ref.id}`} value={ref.id}>
                    {ref.specimenTitle} ({ref.geologicalPeriod})
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
          </div>
        </div>

        {/* SPECIMEN B SELECTOR */}
        <div className="p-3 bg-white rounded-2xl border-2 border-sky-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[9px] font-bold flex items-center justify-center">
                B
              </span>
              <span>Secondary Specimen</span>
            </span>
            {isUserSpecimen(specimenB.id) && (
              <span className="text-[9px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded">
                ★ Your Upload
              </span>
            )}
          </div>

          <div className="relative">
            <select
              value={selectedIdB}
              onChange={(e) => setSelectedIdB(e.target.value)}
              className="w-full text-xs font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-2 appearance-none focus:outline-none focus:border-sky-500 pr-8"
            >
              {userCollection.length > 0 && (
                <optgroup label="📂 Your Uploaded Collection">
                  {userCollection.map(f => (
                    <option key={`b-${f.id}`} value={f.id}>
                      ★ {f.specimenTitle} ({f.geologicalPeriod})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="🏛️ Curated Museum Reference Specimens">
                {CURATED_REFERENCE_SPECIMENS.map(ref => (
                  <option key={`b-${ref.id}`} value={ref.id}>
                    {ref.specimenTitle} ({ref.geologicalPeriod})
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
          </div>
        </div>

      </div>

      {/* Side-by-Side Visual Specimen Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* CARD A */}
        <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                A
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${periodBadgeA.bg}`}>
                {specimenA.geologicalPeriod}
              </span>
              <span className="text-[10px] font-mono text-gray-500 ml-auto">
                ~{ageA.toFixed(0)} Ma
              </span>
            </div>

            <div className="flex gap-3 items-center">
              {specimenA.userPhotoUrl && (
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0 shadow-2xs">
                  <img
                    src={specimenA.userPhotoUrl}
                    alt={specimenA.specimenTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-gray-900 leading-tight">
                  {specimenA.specimenTitle}
                </h4>
                <div className="text-[11px] font-serif italic text-gray-600 mt-0.5">
                  {specimenA.taxaName}
                </div>
                <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200/60 inline-block mt-1 truncate max-w-full">
                  {specimenA.elementIdentified}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectSpecimen(specimenA)}
            className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
          >
            <Compass size={12} />
            <span>Examine Specimen A on Map</span>
          </button>
        </div>

        {/* CARD B */}
        <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                B
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${periodBadgeB.bg}`}>
                {specimenB.geologicalPeriod}
              </span>
              <span className="text-[10px] font-mono text-gray-500 ml-auto">
                ~{ageB.toFixed(0)} Ma
              </span>
            </div>

            <div className="flex gap-3 items-center">
              {specimenB.userPhotoUrl && (
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0 shadow-2xs">
                  <img
                    src={specimenB.userPhotoUrl}
                    alt={specimenB.specimenTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-gray-900 leading-tight">
                  {specimenB.specimenTitle}
                </h4>
                <div className="text-[11px] font-serif italic text-gray-600 mt-0.5">
                  {specimenB.taxaName}
                </div>
                <div className="text-[10px] font-semibold text-sky-800 bg-sky-50/80 px-1.5 py-0.5 rounded border border-sky-200/60 inline-block mt-1 truncate max-w-full">
                  {specimenB.elementIdentified}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectSpecimen(specimenB)}
            className="w-full py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
          >
            <Compass size={12} />
            <span>Examine Specimen B on Map</span>
          </button>
        </div>

      </div>

      {/* Temporal Divergence Bar */}
      <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-gray-800 flex items-center gap-1.5 text-[11px]">
            <Clock size={12} className="text-indigo-600" />
            <span>Temporal Divergence in Deep Time:</span>
          </span>
          <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {temporalDiff === 0 
              ? 'Contemporaneous Horizons (~Same Age)' 
              : `~${temporalDiff.toFixed(1)} Million Years Apart`}
          </span>
        </div>

        {/* Mini Mesozoic Divergence Track */}
        <div className="relative pt-3 pb-1">
          <div className="h-2 rounded-full overflow-hidden flex bg-gray-200">
            <div style={{ width: '27.4%' }} className="bg-purple-400" title="Triassic"></div>
            <div style={{ width: '30.1%' }} className="bg-sky-400" title="Jurassic"></div>
            <div style={{ width: '42.5%' }} className="bg-emerald-400" title="Cretaceous"></div>
          </div>

          {/* Pin A */}
          <div 
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${Math.max(3, Math.min(97, ((252 - Math.max(66, Math.min(252, ageA))) / (252 - 66)) * 100))}%` }}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white font-bold text-[8px] flex items-center justify-center shadow-xs border border-white">
              A
            </span>
          </div>

          {/* Pin B */}
          <div 
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${Math.max(3, Math.min(97, ((252 - Math.max(66, Math.min(252, ageB))) / (252 - 66)) * 100))}%` }}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-sky-600 text-white font-bold text-[8px] flex items-center justify-center shadow-xs border border-white">
              B
            </span>
          </div>
        </div>

        <div className="flex justify-between text-[8px] font-mono text-gray-400 px-0.5">
          <span>Triassic (252 Ma)</span>
          <span>Jurassic (201 Ma)</span>
          <span>Cretaceous (66 Ma)</span>
        </div>
      </div>

      {/* COMPREHENSIVE SIDE-BY-SIDE SUMMARY TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <Layers size={13} className="text-emerald-700" />
            <span>Stratigraphic & Osteological Comparison Matrix</span>
          </h4>
          <span className="text-[10px] font-mono text-gray-500">
            Specimen A vs Specimen B
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-2.5 px-3.5 w-1/4">Comparative Metric</th>
                <th className="py-2.5 px-3.5 w-[37.5%] text-emerald-900 bg-emerald-50/40 border-r border-gray-200">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 text-white text-[7px] font-bold flex items-center justify-center">A</span>
                    <span>{specimenA.commonName || specimenA.taxaName}</span>
                  </div>
                </th>
                <th className="py-2.5 px-3.5 w-[37.5%] text-sky-900 bg-sky-50/40">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-sky-600 text-white text-[7px] font-bold flex items-center justify-center">B</span>
                    <span>{specimenB.commonName || specimenB.taxaName}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              
              {/* 1. Geological Era & Period */}
              <tr className="hover:bg-gray-50/80 transition-colors">
                <td className="py-2.5 px-3.5 font-bold text-gray-700 text-[11px] bg-gray-50/30">
                  Geological Era & Period
                </td>
                <td className="py-2.5 px-3.5 border-r border-gray-100">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${periodBadgeA.bg} mb-1`}>
                    {specimenA.geologicalPeriod}
                  </span>
                  <div className="text-[10px] font-mono text-gray-500">
                    Era: {specimenA.geologicalEra}
                  </div>
                </td>
                <td className="py-2.5 px-3.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${periodBadgeB.bg} mb-1`}>
                    {specimenB.geologicalPeriod}
                  </span>
                  <div className="text-[10px] font-mono text-gray-500">
                    Era: {specimenB.geologicalEra}
                  </div>
                </td>
              </tr>

              {/* 2. Specimen Anatomical Element */}
              <tr className="hover:bg-gray-50/80 transition-colors bg-gray-50/20">
                <td className="py-2.5 px-3.5 font-bold text-gray-700 text-[11px] bg-gray-50/30">
                  Specimen Anatomical Element
                </td>
                <td className="py-2.5 px-3.5 border-r border-gray-100">
                  <div className="font-extrabold text-gray-900 text-xs">
                    {specimenA.elementIdentified}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Category: {specimenA.fossilCategory}
                  </div>
                </td>
                <td className="py-2.5 px-3.5">
                  <div className="font-extrabold text-gray-900 text-xs">
                    {specimenB.elementIdentified}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Category: {specimenB.fossilCategory}
                  </div>
                </td>
              </tr>

              {/* 3. Estimated Chronological Dating */}
              <tr className="hover:bg-gray-50/80 transition-colors">
                <td className="py-2.5 px-3.5 font-bold text-gray-700 text-[11px] bg-gray-50/30">
                  Chronological Dating
                </td>
                <td className="py-2.5 px-3.5 font-mono text-xs font-bold text-gray-900 border-r border-gray-100">
                  {specimenA.estimatedAge}
                </td>
                <td className="py-2.5 px-3.5 font-mono text-xs font-bold text-gray-900">
                  {specimenB.estimatedAge}
                </td>
              </tr>

              {/* 4. Excavation Formation & Locality */}
              <tr className="hover:bg-gray-50/80 transition-colors bg-gray-50/20">
                <td className="py-2.5 px-3.5 font-bold text-gray-700 text-[11px] bg-gray-50/30">
                  Excavation Formation
                </td>
                <td className="py-2.5 px-3.5 border-r border-gray-100">
                  <div className="font-bold text-gray-900">
                    {specimenA.primaryFormation.name}
                  </div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-emerald-600" />
                    <span>{specimenA.primaryFormation.locationName}, {specimenA.primaryFormation.country}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3.5">
                  <div className="font-bold text-gray-900">
                    {specimenB.primaryFormation.name}
                  </div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-sky-600" />
                    <span>{specimenB.primaryFormation.locationName}, {specimenB.primaryFormation.country}</span>
                  </div>
                </td>
              </tr>

              {/* 5. Depositional Paleoenvironment */}
              <tr className="hover:bg-gray-50/80 transition-colors">
                <td className="py-2.5 px-3.5 font-bold text-gray-700 text-[11px] bg-gray-50/30">
                  Paleoenvironment
                </td>
                <td className="py-2.5 px-3.5 text-xs text-gray-700 border-r border-gray-100 leading-snug">
                  {specimenA.primaryFormation.environment}
                </td>
                <td className="py-2.5 px-3.5 text-xs text-gray-700 leading-snug">
                  {specimenB.primaryFormation.environment}
                </td>
              </tr>

              {/* 6. Preservation Grade & Condition */}
              <tr className="hover:bg-gray-50/80 transition-colors bg-gray-50/20">
                <td className="py-2.5 px-3.5 font-bold text-gray-700 text-[11px] bg-gray-50/30">
                  Preservation Condition
                </td>
                <td className="py-2.5 px-3.5 border-r border-gray-100">
                  <div className="text-xs font-semibold text-gray-800">
                    {specimenA.preservationQuality}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {specimenA.collectorCareGuide}
                  </div>
                </td>
                <td className="py-2.5 px-3.5">
                  <div className="text-xs font-semibold text-gray-800">
                    {specimenB.preservationQuality}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {specimenB.collectorCareGuide}
                  </div>
                </td>
              </tr>

              {/* 7. Diagnostic Visual Markers */}
              <tr className="hover:bg-gray-50/80 transition-colors">
                <td className="py-2.5 px-3.5 font-bold text-gray-700 text-[11px] bg-gray-50/30">
                  Key Diagnostic Features
                </td>
                <td className="py-2.5 px-3.5 border-r border-gray-100">
                  <ul className="space-y-1 text-[11px] text-gray-700">
                    {specimenA.visualObservations.slice(0, 2).map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-2.5 px-3.5">
                  <ul className="space-y-1 text-[11px] text-gray-700">
                    {specimenB.visualObservations.slice(0, 2).map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1"></span>
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Specimen Banner */}
      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-600">
          <Upload size={14} className="text-gray-500" />
          <span>Want to compare your own discoveries? Upload a fossil photo to add it to your comparator.</span>
        </div>
        <button
          onClick={onOpenUploadModal}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors shadow-2xs shrink-0"
        >
          Upload Fossil
        </button>
      </div>

    </div>
  );
};

export default SpecimenComparator;
