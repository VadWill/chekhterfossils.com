import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  X, 
  AlertCircle, 
  Loader2, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Image as ImageIcon,
  Compass,
  ArrowRight
} from 'lucide-react';
import { SAMPLE_FOSSILS, SampleFossil } from '../data/sampleFossils';
import { analyzeFossilPhoto } from '../services/geminiService';
import { FossilAnalysisResult, PaleoData, SiteMarker } from '../types';

interface FossilUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFossilIdentified: (payload: {
    result: FossilAnalysisResult;
    paleoData: PaleoData;
    markers: SiteMarker[];
  }) => void;
}

export const FossilUploadModal: React.FC<FossilUploadModalProps> = ({
  isOpen,
  onClose,
  onFossilIdentified
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [collectorNote, setCollectorNote] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    'Scanning visual mineralogy & skeletal markers...',
    'Consulting global paleontological database...',
    'Identifying prehistoric species & anatomical element...',
    'Locating geological formation & GPS digging coordinates...'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setAnalysisStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1500);
    } else {
      setAnalysisStep(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!isOpen) return null;

  const handleFiles = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, WEBP, or HEIC).');
      return;
    }
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedImage(dataUrl);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file. Please try another.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleSampleSelect = (sample: SampleFossil) => {
    setErrorMsg(null);
    setSelectedImage(sample.thumbnailSvg);
    setImageName(`${sample.title} (Curated Sample)`);
    setCollectorNote(sample.hint);
  };

  const startAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisStep(0);

    try {
      const payload = await analyzeFossilPhoto(selectedImage, collectorNote);
      onFossilIdentified(payload);
      onClose();
    } catch (err: any) {
      console.error('Fossil analysis failed:', err);
      setErrorMsg(
        err?.message?.includes('429') || err?.message?.includes('quota')
          ? 'Paleontological analysis quota momentarily exceeded. Please retry in a few moments.'
          : 'Could not complete identification for this photo. Please try another image or a sample specimen.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in">
      <div 
        className="bg-[#fcfbf7] border-2 border-park-card-border rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-auto relative z-10 max-h-[96vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#faf8f2] border-b border-park-card-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-700 shadow-xs shrink-0">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-hand font-bold text-park-tree leading-tight truncate">
                Identify Fossil & Map Origin
              </h2>
              <p className="text-[10px] sm:text-[11px] font-rounded font-semibold text-park-ink-muted truncate">
                Analyze your fossil photo to describe the species and locate origin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isAnalyzing}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-park-ink transition-colors disabled:opacity-30 shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs font-rounded">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Drop Zone or Image Preview */}
          {!selectedImage ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 sm:gap-3 ${
                dragActive
                  ? 'border-amber-500 bg-amber-50/50 scale-[1.01]'
                  : 'border-park-card-border bg-white hover:border-park-border-green/80 hover:bg-white/90 shadow-xs'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFiles(e.target.files[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFiles(e.target.files[0])}
              />

              <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                <Upload size={28} />
              </div>

              <div>
                <p className="text-base font-rounded font-bold text-park-tree">
                  Drag and drop your fossil photo here
                </p>
                <p className="text-xs font-rounded text-park-ink-muted mt-0.5">
                  Supports JPG, PNG, WEBP, or HEIC camera captures
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 bg-park-tree text-white rounded-xl text-xs font-rounded font-bold hover:bg-park-tree/90 shadow-xs transition-all flex items-center gap-1.5"
                >
                  <ImageIcon size={14} /> Browse Photo
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="px-4 py-2 bg-white border border-park-card-border text-park-tree rounded-xl text-xs font-rounded font-bold hover:bg-park-card-muted shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Camera size={14} /> Take Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-park-card-border p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-park-card-border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span className="text-xs font-rounded font-bold text-park-ink">
                    Photo Selected: <span className="text-park-tree">{imageName}</span>
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    setSelectedImage(null);
                    setImageName('');
                  }}
                  className="text-xs font-rounded font-bold text-rose-600 hover:text-rose-800 disabled:opacity-30"
                >
                  Change Photo
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-40 h-40 bg-[#f4f1e6] rounded-2xl border border-park-card-border overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  <img
                    src={selectedImage}
                    alt="Uploaded fossil"
                    className="w-full h-full object-contain p-1"
                  />
                </div>

                <div className="flex-1 w-full space-y-2">
                  <label className="text-[11px] font-rounded font-bold text-park-ink-muted uppercase block">
                    Optional Provenance Clue / Notes
                  </label>
                  <textarea
                    rows={3}
                    disabled={isAnalyzing}
                    placeholder="e.g. Bought in Morocco, found in river gravel in Montana, inherited, matrix stone color..."
                    value={collectorNote}
                    onChange={(e) => setCollectorNote(e.target.value)}
                    className="w-full p-3 text-xs font-rounded bg-park-card-muted/50 border border-park-card-border rounded-xl focus:outline-none focus:border-amber-500 transition-colors placeholder:text-park-ink-muted/50 resize-none"
                  />
                  <p className="text-[10px] font-rounded text-park-ink-muted">
                    Any hints will help Gemini narrow down the precise digging layer or formation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Select Curated Specimens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-rounded font-extrabold uppercase text-park-ink tracking-wider">
                Or Try Sample Museum Specimen
              </span>
              <span className="text-[10px] font-rounded text-park-ink-muted">
                Instant testing without photo
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SAMPLE_FOSSILS.map((sample) => {
                const isCurrent = imageName.includes(sample.title);
                return (
                  <button
                    key={sample.id}
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => handleSampleSelect(sample)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                        : 'border-park-card-border bg-white hover:border-amber-400 hover:bg-amber-50/30'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/5 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={sample.thumbnailSvg} alt={sample.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-rounded font-bold text-park-ink truncate">
                        {sample.title}
                      </div>
                      <div className="text-[10px] font-hand font-bold text-park-ink-muted truncate">
                        {sample.formation}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer / Analysis Action */}
        <div className="p-4 bg-[#faf8f2] border-t border-park-card-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] font-rounded text-park-ink-muted flex items-center gap-1.5">
            <Compass size={14} className="text-park-tree" />
            <span>AI automatically identifies species, formation & plots map markers</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={onClose}
              className="px-4 py-2 bg-white border border-park-card-border text-park-ink rounded-xl text-xs font-rounded font-bold hover:bg-park-card-muted transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedImage || isAnalyzing}
              onClick={startAnalysis}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-rounded font-extrabold shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Analyzing Fossil...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Identify & Plot on Map</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Animated Loading Overlay during Processing */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-[#faf8f2]/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-8 text-center animate-in">
            <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
              <Sparkles size={28} className="text-amber-600 absolute animate-pulse" />
            </div>

            <h3 className="text-2xl font-hand font-bold text-park-tree mb-1">
              Paleontological Appraisal in Progress
            </h3>

            <p className="text-sm font-rounded font-extrabold text-amber-700 animate-pulse min-h-[24px]">
              {steps[analysisStep]}
            </p>

            <div className="w-64 h-2 bg-black/5 rounded-full overflow-hidden mt-4">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${((analysisStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>

            <p className="text-[11px] font-rounded text-park-ink-muted mt-3 max-w-xs">
              Pinpointing geographic coordinates of the original fossilized stratum...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
