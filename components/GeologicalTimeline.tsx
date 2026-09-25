import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  Info, 
  Compass, 
  Activity, 
  RotateCcw,
  Layers,
  Thermometer,
  Trees,
  Skull
} from 'lucide-react';
import { PaleoData, FossilAnalysisResult } from '../types';

interface GeologicalTimelineProps {
  selectedSite: PaleoData | null;
  activeFossil: FossilAnalysisResult | null;
  activeTaxaName: string;
}

// Major Geological Periods across the Mesozoic Era (252 Ma to 66 Ma)
// Official ICS (International Commission on Stratigraphy) color codes and boundaries
interface PeriodSegment {
  name: string;
  startMa: number;
  endMa: number;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  colorBadge: string;
  epochList: string[];
  climateSummary: string;
  faunaSummary: string;
  keyEvents: string;
}

const GEOLOGICAL_PERIODS: PeriodSegment[] = [
  {
    name: 'Triassic',
    startMa: 252,
    endMa: 201,
    colorBg: 'bg-purple-500/15',
    colorBorder: 'border-purple-500/50',
    colorText: 'text-purple-700',
    colorBadge: 'bg-purple-600',
    epochList: ['Early (252–247)', 'Middle (247–237)', 'Late (237–201)'],
    climateSummary: 'Hot, arid supercontinent Pangaea interior; global deserts and monsoonal coastal belts.',
    faunaSummary: 'Origin of earliest agile dinosaurs (Eoraptor, Coelophysis) amidst dominant archosaurs and therapsids.',
    keyEvents: 'Permian recovery (252 Ma) → First true dinosaurs emerge (231 Ma) → Tr-J Extinction (201 Ma).'
  },
  {
    name: 'Jurassic',
    startMa: 201,
    endMa: 145,
    colorBg: 'bg-sky-500/15',
    colorBorder: 'border-sky-500/50',
    colorText: 'text-sky-700',
    colorBadge: 'bg-sky-600',
    epochList: ['Early (201–174)', 'Middle (174–163)', 'Late (163–145)'],
    climateSummary: 'Pangaea rifts into Laurasia and Gondwana; warm, humid greenhouse world with lush conifer and cycad forests.',
    faunaSummary: 'Golden age of colossal sauropods (Brachiosaurus, Diplodocus), apex theropods (Allosaurus), and earliest birds (Archaeopteryx).',
    keyEvents: 'Pangaean breakup → Super-massive sauropod radiation → Morrison & Tendaguru deposition.'
  },
  {
    name: 'Cretaceous',
    startMa: 145,
    endMa: 66,
    colorBg: 'bg-emerald-500/15',
    colorBorder: 'border-emerald-500/50',
    colorText: 'text-emerald-700',
    colorBadge: 'bg-emerald-600',
    epochList: ['Early (145–100)', 'Late (100–66)'],
    climateSummary: 'High sea levels flooding continents (Western Interior Seaway); emergence of flowering plants (angiosperms).',
    faunaSummary: 'Apex morphological divergence: Tyrannosaurids, Spinosaurids, Ceratopsians, Hadrosaurs, and armored Ankylosaurs.',
    keyEvents: 'Cenomanian thermal maximum → High diversity Hell Creek ecosystems → Chicxulub asteroid impact at 66 Ma.'
  }
];

// Key evolutionary milestones across deep time
const CHRONO_MILESTONES = [
  { ma: 231, label: 'Earliest Dinosaurs', period: 'Triassic', icon: '🦕' },
  { ma: 201, label: 'Tr-J Extinction', period: 'Boundary', icon: '⚡' },
  { ma: 153, label: 'Morrison Giants', period: 'Jurassic', icon: '🌿' },
  { ma: 125, label: 'Feathered Yixian', period: 'Cretaceous', icon: '🪶' },
  { ma: 97, label: 'Spinosaurid Rivers', period: 'Cretaceous', icon: '🐊' },
  { ma: 68, label: 'Hell Creek Apex', period: 'Cretaceous', icon: '🦖' },
  { ma: 66, label: 'K-Pg Mass Extinction', period: 'Extinction', icon: '☄️' }
];

export const GeologicalTimeline: React.FC<GeologicalTimelineProps> = ({
  selectedSite,
  activeFossil,
  activeTaxaName
}) => {
  // Parse specimen estimated age (in Ma) from data
  const specimenAgeMa = useMemo(() => {
    const rawAgeStr = activeFossil?.estimatedAge || selectedSite?.geologicalContext.age || '';
    const rawPeriodStr = activeFossil?.geologicalPeriod || selectedSite?.geologicalContext.period || '';
    const rawTaxa = (activeFossil?.taxaName || activeTaxaName || '').toLowerCase();

    // 1. Try regex extraction from age string (e.g. "68 - 66 Ma" -> 67, "155 Ma" -> 155, "95-100" -> 97.5)
    const matches = rawAgeStr.match(/(\d+(?:\.\d+)?)/g);
    if (matches && matches.length >= 2) {
      const num1 = parseFloat(matches[0]);
      const num2 = parseFloat(matches[1]);
      if (num1 >= 60 && num1 <= 260 && num2 >= 60 && num2 <= 260) {
        return (num1 + num2) / 2;
      }
    } else if (matches && matches.length === 1) {
      const num = parseFloat(matches[0]);
      if (num >= 60 && num <= 260) {
        return num;
      }
    }

    // 2. Taxon specific curated dates
    if (rawTaxa.includes('tyranno') || rawTaxa.includes('rex')) return 67;
    if (rawTaxa.includes('triceratops')) return 67;
    if (rawTaxa.includes('ankylosaur')) return 67;
    if (rawTaxa.includes('velociraptor')) return 72;
    if (rawTaxa.includes('spino')) return 96;
    if (rawTaxa.includes('brachio')) return 153;
    if (rawTaxa.includes('allosaur')) return 152;
    if (rawTaxa.includes('stego')) return 152;
    if (rawTaxa.includes('diplo')) return 154;
    if (rawTaxa.includes('dilopho')) return 193;
    if (rawTaxa.includes('coelophysis')) return 210;
    if (rawTaxa.includes('plateosaur')) return 214;
    if (rawTaxa.includes('iguanodon')) return 125;
    if (rawTaxa.includes('utahraptor')) return 130;
    if (rawTaxa.includes('parasaurolophus')) return 74;

    // 3. Infer from period string
    const pLower = rawPeriodStr.toLowerCase();
    if (pLower.includes('late cretaceous') || pLower.includes('maastrichtian')) return 68;
    if (pLower.includes('campanian')) return 75;
    if (pLower.includes('cenomanian')) return 95;
    if (pLower.includes('early cretaceous') || pLower.includes('albian') || pLower.includes('aptian')) return 120;
    if (pLower.includes('cretaceous')) return 85;
    if (pLower.includes('late jurassic') || pLower.includes('tithonian') || pLower.includes('kimmeridgian')) return 152;
    if (pLower.includes('middle jurassic')) return 168;
    if (pLower.includes('early jurassic')) return 190;
    if (pLower.includes('jurassic')) return 160;
    if (pLower.includes('late triassic') || pLower.includes('norian') || pLower.includes('carnian')) return 215;
    if (pLower.includes('middle triassic')) return 240;
    if (pLower.includes('triassic')) return 225;

    // Default Fallback
    return 75;
  }, [selectedSite, activeFossil, activeTaxaName]);

  // Interactive timeline slider state (in Ma)
  const [scrubberMa, setScrubberMa] = useState<number>(specimenAgeMa);

  // Update scrubber if specimen changes
  React.useEffect(() => {
    setScrubberMa(specimenAgeMa);
  }, [specimenAgeMa]);

  // Convert age in Ma (252 to 66) to percentage across the timeline (0% = 252 Ma, 100% = 66 Ma)
  const getPercentageFromMa = (ma: number): number => {
    const clamped = Math.max(66, Math.min(252, ma));
    return ((252 - clamped) / (252 - 66)) * 100;
  };

  // Convert percentage back to Ma
  const getMaFromPercentage = (pct: number): number => {
    const clampedPct = Math.max(0, Math.min(100, pct));
    return Math.round(252 - (clampedPct / 100) * (252 - 66));
  };

  const specimenPct = getPercentageFromMa(specimenAgeMa);
  const scrubberPct = getPercentageFromMa(scrubberMa);

  // Determine current active period for the scrubbed value
  const activeScrubberPeriod = useMemo(() => {
    return GEOLOGICAL_PERIODS.find(p => scrubberMa <= p.startMa && scrubberMa >= p.endMa) || GEOLOGICAL_PERIODS[1];
  }, [scrubberMa]);

  // Determine which period the specimen belongs to
  const specimenPeriod = useMemo(() => {
    return GEOLOGICAL_PERIODS.find(p => specimenAgeMa <= p.startMa && specimenAgeMa >= p.endMa) || GEOLOGICAL_PERIODS[2];
  }, [specimenAgeMa]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs space-y-3.5 select-none">
      
      {/* Header with Title and Snap Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-2xs">
            <Clock size={13} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
              <span>Geological Deep Time Chronology</span>
              <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                Mesozoic Era
              </span>
            </h4>
            <div className="text-[10px] text-gray-500 font-medium">
              Temporal positioning across Triassic, Jurassic & Cretaceous
            </div>
          </div>
        </div>

        {scrubberMa !== specimenAgeMa && (
          <button
            onClick={() => setScrubberMa(specimenAgeMa)}
            className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[10px] font-bold flex items-center gap-1 transition-colors shadow-2xs active:scale-95"
            title="Snap back to current specimen date"
          >
            <RotateCcw size={10} />
            <span>Snap to Specimen ({specimenAgeMa.toFixed(0)} Ma)</span>
          </button>
        )}
      </div>

      {/* Specimen Temporal Placement Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-50/80 to-indigo-50/50 border border-amber-200/70 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0"></div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wide block leading-none">
              Specimen Geological Horizon
            </span>
            <span className="font-extrabold text-gray-900 text-xs truncate block mt-0.5">
              {activeFossil?.specimenTitle || activeTaxaName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${specimenPeriod.colorBadge}`}>
            {specimenPeriod.name}
          </span>
          <span className="font-mono font-bold text-xs text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
            ~{specimenAgeMa.toFixed(1)} Ma
          </span>
        </div>
      </div>

      {/* Visual Timeline Bar & Epoch Blocks */}
      <div className="space-y-1.5 pt-1">
        
        {/* Period Labels Bar (Proportional widths: Triassic 51Myr, Jurassic 56Myr, Cretaceous 79Myr) */}
        <div className="grid grid-cols-12 gap-1 text-[10px] font-bold uppercase tracking-wider text-center">
          {/* Triassic: 51 / 186 = ~27.4% -> 3.3 cols */}
          <div className="col-span-3 text-purple-700 bg-purple-50/90 border border-purple-200 py-1 rounded-md flex flex-col items-center justify-center">
            <span>Triassic</span>
            <span className="text-[8px] font-mono text-purple-600 font-semibold lowercase">252–201 Ma</span>
          </div>

          {/* Jurassic: 56 / 186 = ~30.1% -> 3.6 cols */}
          <div className="col-span-4 text-sky-700 bg-sky-50/90 border border-sky-200 py-1 rounded-md flex flex-col items-center justify-center">
            <span>Jurassic</span>
            <span className="text-[8px] font-mono text-sky-600 font-semibold lowercase">201–145 Ma</span>
          </div>

          {/* Cretaceous: 79 / 186 = ~42.5% -> 5.1 cols */}
          <div className="col-span-5 text-emerald-700 bg-emerald-50/90 border border-emerald-200 py-1 rounded-md flex flex-col items-center justify-center">
            <span>Cretaceous</span>
            <span className="text-[8px] font-mono text-emerald-600 font-semibold lowercase">145–66 Ma</span>
          </div>
        </div>

        {/* The Continuous Chronological Track (252 Ma to 66 Ma) */}
        <div className="relative pt-6 pb-4">
          
          {/* Main Stratigraphic Colored Track */}
          <div className="h-4.5 rounded-full overflow-hidden flex border border-gray-300 shadow-inner bg-gray-100 relative">
            {/* Triassic Band (27.4%) */}
            <div 
              style={{ width: '27.42%' }} 
              className="h-full bg-gradient-to-r from-purple-400 to-purple-500 border-r border-purple-600/30 flex items-center justify-center text-[9px] font-bold text-white/90"
              title="Triassic Period (252 - 201 Ma)"
            >
              252
            </div>

            {/* Jurassic Band (30.1%) */}
            <div 
              style={{ width: '30.11%' }} 
              className="h-full bg-gradient-to-r from-sky-400 to-sky-500 border-r border-sky-600/30 flex items-center justify-center text-[9px] font-bold text-white/90"
              title="Jurassic Period (201 - 145 Ma)"
            >
              201
            </div>

            {/* Cretaceous Band (42.47%) */}
            <div 
              style={{ width: '42.47%' }} 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center justify-between px-2 text-[9px] font-bold text-white/90"
              title="Cretaceous Period (145 - 66 Ma)"
            >
              <span>145</span>
              <span>66 Ma</span>
            </div>
          </div>

          {/* Key Evolutionary Milestones Pins */}
          {CHRONO_MILESTONES.map((m, i) => {
            const posPct = getPercentageFromMa(m.ma);
            return (
              <div 
                key={i} 
                className="absolute top-1.5 -translate-x-1/2 flex flex-col items-center group cursor-pointer z-10"
                style={{ left: `${posPct}%` }}
                onClick={() => setScrubberMa(m.ma)}
                title={`${m.label} (~${m.ma} Ma)`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-indigo-600 group-hover:scale-125 transition-all"></div>
                <div className="w-px h-3 bg-gray-300"></div>
                <span className="text-[10px] transform group-hover:scale-125 transition-transform">
                  {m.icon}
                </span>

                {/* Hover Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-full mb-1 bg-gray-900 text-white text-[9px] font-mono px-2 py-0.5 rounded shadow-lg whitespace-nowrap transition-opacity z-30">
                  {m.label} ({m.ma} Ma)
                </div>
              </div>
            );
          })}

          {/* ACTIVE SPECIMEN PIN (Highlighted Beacon with Callout) */}
          <div 
            className="absolute top-0 -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer pointer-events-none"
            style={{ left: `${specimenPct}%` }}
          >
            {/* Top Glowing Marker */}
            <div className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md border border-white flex items-center gap-1 animate-bounce">
              <span>📍</span>
              <span className="hidden sm:inline">Specimen</span>
            </div>
            
            {/* Vertical Marker Line */}
            <div className="w-0.5 h-8 bg-amber-500 shadow-xs"></div>
            
            {/* Pulse Target Dot */}
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-md -mt-1 relative">
              <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75"></div>
            </div>
          </div>

          {/* INTERACTIVE RANGE SCRUBBER SLIDER */}
          <input
            type="range"
            min="66"
            max="252"
            step="0.5"
            value={252 - (scrubberMa - 66)} // Invert so sliding right moves toward recent 66 Ma
            onChange={(e) => {
              const inverted = parseFloat(e.target.value);
              setScrubberMa(252 - (inverted - 66));
            }}
            className="w-full absolute inset-x-0 bottom-3.5 opacity-0 cursor-ew-resize h-6 z-30"
            title="Drag slider to inspect different geological ages"
          />
        </div>

        {/* Scale Boundary Labels */}
        <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 px-1 -mt-1">
          <span>252 Ma (Permian Extinction)</span>
          <span className="text-gray-500 font-semibold italic text-[9px]">← Drag to scrub geological timeline →</span>
          <span className="text-rose-600 font-semibold">66 Ma (K-Pg Asteroid Impact)</span>
        </div>
      </div>

      {/* Scrubbed Horizon Deep-Time Information Dossier */}
      <div className={`p-3 rounded-xl border ${activeScrubberPeriod.colorBorder} ${activeScrubberPeriod.colorBg} transition-colors`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${activeScrubberPeriod.colorBadge}`}>
              {activeScrubberPeriod.name} Period
            </span>
            <span className="text-xs font-black text-gray-900 font-mono">
              ~{scrubberMa.toFixed(1)} Million Years Ago
            </span>
          </div>

          <span className="text-[10px] text-gray-600 font-medium">
            {scrubberMa === specimenAgeMa ? '★ Exact Specimen Match' : 'Temporal Exploration'}
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-start gap-1.5 text-gray-800 leading-snug">
            <Thermometer size={13} className="text-amber-600 shrink-0 mt-0.5" />
            <span className="text-[11px]">
              <strong className="text-gray-900">Paleoclimate:</strong> {activeScrubberPeriod.climateSummary}
            </span>
          </div>

          <div className="flex items-start gap-1.5 text-gray-800 leading-snug">
            <Trees size={13} className="text-emerald-700 shrink-0 mt-0.5" />
            <span className="text-[11px]">
              <strong className="text-gray-900">Ecosystem & Life:</strong> {activeScrubberPeriod.faunaSummary}
            </span>
          </div>

          <div className="flex items-start gap-1.5 text-gray-800 leading-snug border-t border-gray-200/60 pt-1.5 mt-1">
            <Sparkles size={13} className="text-indigo-600 shrink-0 mt-0.5" />
            <span className="text-[10px] text-gray-600 font-medium">
              <strong>Geological Keynote:</strong> {activeScrubberPeriod.keyEvents}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GeologicalTimeline;
