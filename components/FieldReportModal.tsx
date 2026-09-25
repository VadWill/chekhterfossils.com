import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  FileText, 
  MapPin, 
  Calendar, 
  User, 
  Award, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Edit3,
  Eye,
  FileCheck2,
  Share2
} from 'lucide-react';
import { PaleoData, FossilAnalysisResult, SiteMarker } from '../types';

interface FieldReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSite: PaleoData | null;
  activeFossil: FossilAnalysisResult | null;
  activeQuery: string;
  blueprintImage: string | null;
  currentMarker?: SiteMarker;
}

export const FieldReportModal: React.FC<FieldReportModalProps> = ({
  isOpen,
  onClose,
  selectedSite,
  activeFossil,
  activeQuery,
  blueprintImage,
  currentMarker
}) => {
  const [surveyorName, setSurveyorName] = useState('Dr. Field Investigator');
  const [expeditionDate, setExpeditionDate] = useState(
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  );
  const [fieldNotesInput, setFieldNotesInput] = useState(
    activeFossil?.userNotes 
      ? `Specimen Note: ${activeFossil.userNotes}\nField verification conducted in situ with stratigraphic correlation.` 
      : 'Stratigraphic layer inspected. Sedimentary matrix documented and cross-referenced with global paleontological archives.'
  );
  const [copied, setCopied] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [previewMode, setPreviewMode] = useState<'pdf' | 'edit'>('pdf');
  const [isFinalizing, setIsFinalizing] = useState(false);

  if (!isOpen || !selectedSite) return null;

  const docId = `PALEO-${activeFossil ? 'SPECIMEN' : 'SITE'}-${Math.abs(
    (selectedSite.name + activeQuery).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ).toString().padStart(6, '0')}`;

  const specimenTitle = activeFossil ? activeFossil.specimenTitle : `${activeQuery} Field Survey`;
  const scientificName = activeFossil ? activeFossil.taxaName : activeQuery;
  const commonName = activeFossil ? activeFossil.commonName : activeQuery;
  const locationName = selectedSite.name;
  const coordinates = selectedSite.coordinates;

  const handlePrint = () => {
    setIsFinalizing(true);
    setTimeout(() => {
      window.print();
      setIsFinalizing(false);
    }, 150);
  };

  const generateMarkdownReport = (): string => {
    return `# PALEONTOLOGICAL FIELD SURVEY & SPECIMEN DOSSIER
**Document ID:** ${docId}
**Date:** ${expeditionDate}
**Field Investigator:** ${surveyorName}
**Institution:** International Paleontological Survey & Fossil Provenance Lab

---

## 1. SPECIMEN & TAXON IDENTIFICATION
- **Specimen Title:** ${specimenTitle}
- **Scientific Name:** ${scientificName}
- **Common Classification:** ${commonName}
${activeFossil ? `- **Anatomical Element:** ${activeFossil.elementIdentified}\n- **Fossil Category:** ${activeFossil.fossilCategory}\n- **Confidence Rating:** ${activeFossil.confidenceScore}% (${activeFossil.confidenceLevel})` : ''}

## 2. GEOGRAPHIC & STRATIGRAPHIC PROVENANCE
- **Excavation Locality:** ${locationName}
- **Coordinates:** ${coordinates.lat.toFixed(5)}° N, ${coordinates.lng.toFixed(5)}° E
- **Geological Era:** ${selectedSite.geologicalContext.era}
- **Period / Epoch:** ${selectedSite.geologicalContext.period}
- **Dating / Age:** ${selectedSite.geologicalContext.age}
- **Paleoenvironment / Climate:** ${selectedSite.geologicalContext.climate}

## 3. SCIENTIFIC ANALYSIS & TAPHONOMY
${activeFossil?.scientificDescription || selectedSite.summary}

${activeFossil?.visualObservations?.length ? `### Diagnostic Visual Markers\n${activeFossil.visualObservations.map((obs, i) => `${i + 1}. ${obs}`).join('\n')}` : ''}

${selectedSite.features?.length ? `### Stratigraphic Features & Inventory\n${selectedSite.features.map(f => `- **${f.name}**: ${f.description}`).join('\n')}` : ''}

## 4. CONSERVATION & PRESERVATION PROTOCOL
${activeFossil ? `- **Preservation Quality:** ${activeFossil.preservationQuality}\n- **Collector Storage Guidelines:** ${activeFossil.collectorCareGuide}` : `- **Survey Status:** Verified paleontological excavation site.`}

## 5. FIELD INVESTIGATOR LOG
${fieldNotesInput}

---
*Report certified by Oleg's Fossil Collection & Paleontology Registry.*
`;
  };

  const handleDownloadMarkdown = () => {
    const mdContent = generateMarkdownReport();
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docId}-${scientificName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(generateMarkdownReport()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const displayImage = activeFossil?.userPhotoUrl || blueprintImage;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in select-none">
      {/* PDF Reader Window Container */}
      <div 
        className="bg-[#2b2e31] rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col my-auto border border-gray-700/80 max-h-[96vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* PDF Reader Top Header Chrome */}
        <div className="no-print px-4 py-2.5 bg-[#1f2124] border-b border-gray-700/80 flex flex-wrap items-center justify-between gap-3 text-gray-200">
          
          {/* File Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-red-600/90 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
              PDF
            </div>
            <div>
              <div className="text-xs font-bold text-gray-100 flex items-center gap-2 leading-none">
                <span>{docId}_{scientificName.replace(/\s+/g, '_')}.pdf</span>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                  Print-Ready A4
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">
                Paleontological Survey Specimen Report • 1 Page
              </span>
            </div>
          </div>

          {/* Viewer Mode & Zoom Toolbar */}
          <div className="flex items-center gap-2 bg-gray-800/90 border border-gray-700/80 px-2 py-1 rounded-lg">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-0.5 border-r border-gray-700 pr-2 mr-1">
              <button
                onClick={() => setPreviewMode('pdf')}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                  previewMode === 'pdf' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                title="Mock PDF Paper View"
              >
                <Eye size={12} />
                <span>PDF Preview</span>
              </button>

              <button
                onClick={() => setPreviewMode('edit')}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                  previewMode === 'edit' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                title="Edit Report Fields"
              >
                <Edit3 size={12} />
                <span>Edit Fields</span>
              </button>
            </div>

            {/* Page Count */}
            <span className="text-[11px] font-mono text-gray-400 px-1">
              Page 1 / 1
            </span>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 pl-1 border-l border-gray-700">
              <button
                onClick={() => setZoomScale((prev) => Math.max(0.65, prev - 0.1))}
                className="p-1 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[10px] font-mono text-gray-300 w-9 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale((prev) => Math.min(1.3, prev + 0.1))}
                className="p-1 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              <button
                onClick={() => setZoomScale(1)}
                className="text-[10px] text-gray-400 hover:text-gray-200 px-1 hover:bg-gray-700 rounded transition-colors"
                title="Reset Zoom to 100%"
              >
                100%
              </button>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyClipboard}
              className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
              title="Copy markdown text to clipboard"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
              title="Download Markdown Documentation"
            >
              <Download size={12} />
              <span>.md</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="Finalize and save as PDF"
            >
              <Printer size={13} />
              <span>Finalize & Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center transition-colors ml-1"
              title="Close Preview"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Mock PDF Canvas Area (Dark Workspace containing centered A4 sheet paper) */}
        <div className="overflow-auto p-2 sm:p-6 bg-[#3d4043] flex justify-center min-h-[350px]">
          
          {/* Zoom Wrapper */}
          <div 
            className="transition-transform duration-150 origin-top flex justify-center w-full"
            style={{ transform: `scale(${zoomScale})` }}
          >
            {/* The Mock PDF Printable Sheet (US Letter / A4 Proportions with Drop Shadow and Crop Marks) */}
            <div 
              id="field-report-print-container"
              className="bg-white border border-gray-300 shadow-[0_15px_50px_rgba(0,0,0,0.55)] rounded-sm p-4 sm:p-8 md:p-10 max-w-3xl w-full text-gray-900 font-sans space-y-4 sm:space-y-6 relative select-text"
              style={{ minHeight: '850px' }}
            >
              
              {/* PDF Corner Registration / Crop Marks (Authentic Print Simulation) */}
              <div className="no-print absolute top-2 left-2 w-3 h-3 border-t border-l border-gray-400 pointer-events-none opacity-60"></div>
              <div className="no-print absolute top-2 right-2 w-3 h-3 border-t border-r border-gray-400 pointer-events-none opacity-60"></div>
              <div className="no-print absolute bottom-2 left-2 w-3 h-3 border-b border-l border-gray-400 pointer-events-none opacity-60"></div>
              <div className="no-print absolute bottom-2 right-2 w-3 h-3 border-b border-r border-gray-400 pointer-events-none opacity-60"></div>

              {/* PDF Running Header */}
              <div className="flex justify-between items-center text-[9px] font-mono uppercase text-gray-400 border-b border-gray-200 pb-1 -mt-2">
                <span>International Paleontological Archives • Field Report</span>
                <span>Document ID: {docId} • Sheet 1 of 1</span>
              </div>

              {/* Report Official Letterhead */}
              <div className="border-b-2 border-gray-900 pb-4 pt-1 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 uppercase">
                      Paleontological Field Survey Report
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 font-semibold tracking-wide mt-0.5">
                    GLOBAL TAPHONOMY ARCHIVES & GEOLOGICAL STRATIGRAPHY REGISTRY
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono mt-1">
                    CLASSIFICATION: FORMAL FIELD SPECIMEN DOSSIER
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-gray-100 border border-gray-300 px-3 py-1 rounded text-xs font-mono font-bold text-gray-800">
                    {docId}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium mt-1">
                    Record: <strong className="text-emerald-700 font-bold">VERIFIED SPECIMEN</strong>
                  </div>
                </div>
              </div>

              {/* Surveyor Metadata Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 block">
                    Field Investigator
                  </label>
                  {previewMode === 'edit' ? (
                    <input
                      type="text"
                      value={surveyorName}
                      onChange={(e) => setSurveyorName(e.target.value)}
                      className="font-bold text-gray-900 bg-white border border-gray-300 rounded px-1.5 py-0.5 focus:border-blue-500 focus:outline-none w-full mt-0.5"
                    />
                  ) : (
                    <div className="font-bold text-gray-900 mt-0.5">
                      {surveyorName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 block">
                    Survey / Discovery Date
                  </label>
                  {previewMode === 'edit' ? (
                    <input
                      type="text"
                      value={expeditionDate}
                      onChange={(e) => setExpeditionDate(e.target.value)}
                      className="font-bold text-gray-900 bg-white border border-gray-300 rounded px-1.5 py-0.5 focus:border-blue-500 focus:outline-none w-full mt-0.5"
                    />
                  ) : (
                    <div className="font-bold text-gray-900 mt-0.5">
                      {expeditionDate}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 block">
                    Excavation Provenance
                  </label>
                  <div className="font-bold text-gray-900 truncate mt-0.5" title={locationName}>
                    {locationName}
                  </div>
                </div>
              </div>

              {/* Specimen Identification Card */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 print-avoid-break">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-200 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {activeFossil ? 'Collection Specimen Appraisal' : 'Taxon Field Survey'}
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">
                      {specimenTitle}
                    </h3>
                    <div className="text-sm font-semibold italic text-gray-600">
                      {scientificName} ({commonName})
                    </div>
                  </div>

                  {activeFossil && (
                    <div className="bg-amber-50 border border-amber-300 px-3.5 py-1.5 rounded-lg text-center shrink-0">
                      <div className="text-[9px] font-bold uppercase text-amber-800">Confidence Match</div>
                      <div className="text-lg font-black text-amber-900 leading-none">
                        {activeFossil.confidenceScore}%
                      </div>
                      <div className="text-[10px] font-semibold text-amber-700">{activeFossil.confidenceLevel}</div>
                    </div>
                  )}
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Element</div>
                    <div className="font-bold text-gray-900 truncate mt-0.5">
                      {activeFossil?.elementIdentified || 'Stratum Skeleton'}
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Geological Era</div>
                    <div className="font-bold text-gray-900 truncate mt-0.5">
                      {selectedSite.geologicalContext.era}
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Period / Epoch</div>
                    <div className="font-bold text-gray-900 truncate mt-0.5">
                      {selectedSite.geologicalContext.period}
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Estimated Age</div>
                    <div className="font-bold text-gray-900 truncate mt-0.5">
                      {selectedSite.geologicalContext.age}
                    </div>
                  </div>
                </div>

                {/* Print-Friendly Chronological Timeline Strip */}
                <div className="mt-3 pt-3 border-t border-gray-200/80">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    <span>Mesozoic Chronology (252 Ma → 66 Ma)</span>
                    <span className="font-mono text-gray-700 font-extrabold">{selectedSite.geologicalContext.period} ({selectedSite.geologicalContext.age})</span>
                  </div>
                  <div className="h-3 rounded overflow-hidden flex border border-gray-300 text-[8px] font-bold text-white text-center leading-none">
                    <div style={{ width: '27.4%' }} className="bg-purple-600 flex items-center justify-center">Triassic</div>
                    <div style={{ width: '30.1%' }} className="bg-sky-600 flex items-center justify-center">Jurassic</div>
                    <div style={{ width: '42.5%' }} className="bg-emerald-600 flex items-center justify-center">Cretaceous</div>
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-mono text-gray-400 mt-0.5">
                    <span>252 Ma</span>
                    <span>201 Ma</span>
                    <span>145 Ma</span>
                    <span>66 Ma (K-Pg Extinction)</span>
                  </div>
                </div>
              </div>

              {/* Photographic Record & Visual Diagnostics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print-avoid-break">
                {/* Image Box */}
                <div className="border border-gray-200 rounded-xl p-3 bg-white flex flex-col items-center justify-center min-h-[220px]">
                  {displayImage ? (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={displayImage}
                        alt={specimenTitle}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 font-medium">No Photographic Capture Available</div>
                  )}
                  <div className="text-[10px] text-gray-500 font-mono mt-2 text-center">
                    FIG 1.0 — {activeFossil ? 'User Specimen Photo Appraisal' : 'Taxon Anatomical Reconstruction'}
                  </div>
                </div>

                {/* Diagnostic Observations */}
                <div className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-600" />
                      <span>Visual Diagnostic Observations</span>
                    </h4>

                    {activeFossil?.visualObservations && activeFossil.visualObservations.length > 0 ? (
                      <div className="space-y-1.5">
                        {activeFossil.visualObservations.map((obs, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-gray-700 leading-tight">{obs}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-xs text-gray-700">
                        {selectedSite.stats.map((stat, i) => (
                          <div key={i} className="flex justify-between border-b border-dotted border-gray-200 pb-1">
                            <span className="text-gray-500">{stat.label}:</span>
                            <span className="font-semibold text-gray-900">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-500 font-mono">
                    GPS Dig Coordinates: {coordinates.lat.toFixed(5)}° N, {coordinates.lng.toFixed(5)}° E
                  </div>
                </div>
              </div>

              {/* Scientific Analysis Summary */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white print-avoid-break">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-1.5 mb-2 flex items-center gap-1.5">
                  <Layers size={13} className="text-blue-600" />
                  <span>Scientific Description & Stratigraphic Analysis</span>
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed text-justify">
                  {activeFossil?.scientificDescription || selectedSite.summary}
                </p>
              </div>

              {/* Conservation & Storage Protocol */}
              {activeFossil && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print-avoid-break">
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                    <div className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1 mb-1">
                      <Award size={12} className="text-amber-600" />
                      <span>Preservation Condition Assessment</span>
                    </div>
                    <p className="text-xs text-gray-800 leading-snug">
                      {activeFossil.preservationQuality}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                    <div className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1 mb-1">
                      <ShieldCheck size={12} className="text-emerald-600" />
                      <span>Collector Storage Guidelines</span>
                    </div>
                    <p className="text-xs text-gray-800 leading-snug">
                      {activeFossil.collectorCareGuide}
                    </p>
                  </div>
                </div>
              )}

              {/* Field Notes (Interactive or Clean Display) */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white print-avoid-break">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-1 mb-2">
                  Field Investigator Notes & Stratum Observations
                </h4>
                {previewMode === 'edit' ? (
                  <textarea
                    rows={3}
                    value={fieldNotesInput}
                    onChange={(e) => setFieldNotesInput(e.target.value)}
                    placeholder="Add custom field notes before printing or exporting..."
                    className="w-full text-xs text-gray-800 bg-gray-50 p-2.5 rounded border border-gray-300 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
                  />
                ) : (
                  <p className="text-xs text-gray-800 leading-relaxed bg-gray-50/70 p-3 rounded border border-gray-200 whitespace-pre-line font-mono">
                    {fieldNotesInput}
                  </p>
                )}
              </div>

              {/* Official Certification Footer / Stamp */}
              <div className="pt-4 border-t-2 border-gray-900 flex justify-between items-end print-avoid-break">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-gray-500 uppercase">
                    CERTIFIED FIELD SURVEY ENTRY • OLEG'S FOSSIL COLLECTION
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    Checksum: {Math.random().toString(36).substring(2, 10).toUpperCase()} • Generated {expeditionDate}
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block border-b border-gray-800 w-44 text-center pb-1 text-xs font-serif italic text-gray-800">
                    {surveyorName}
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mt-1">
                    Authorized Paleontological Sign-Off
                  </div>
                </div>
              </div>

              {/* PDF Mock Footer Page Counter */}
              <div className="no-print pt-2 text-center text-[10px] font-mono text-gray-400 border-t border-gray-100">
                — End of Document • Page 1 of 1 —
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar (Hidden during Print) */}
        <div className="no-print px-6 py-3.5 bg-[#1f2124] border-t border-gray-700/80 flex flex-wrap items-center justify-between gap-3 text-gray-300">
          <div className="text-xs flex items-center gap-2 text-gray-400">
            <FileCheck2 size={16} className="text-emerald-400" />
            <span>
              Mock PDF View active. Review formatted page layout above before finalizing export.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handlePrint}
              disabled={isFinalizing}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Printer size={15} />
              <span>{isFinalizing ? 'Preparing PDF...' : 'Finalize & Download PDF'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FieldReportModal;
