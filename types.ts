
export interface PaleoData {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  summary: string;
  stats: PaleoStat[];
  features: PaleoFeature[];
  geologicalContext: {
    era: string;
    period: string;
    climate: string;
    age: string;
  };
  metadata: {
    threatLevel: string;
    threatScore: number; // 1-5 scale
    diet: string;
    packBehavior: string;
    integument: string;
    flight: string;
    osteologicalCompleteness: number; // 0-100 percentage
  };
}

export interface SiteMarker {
  name: string;
  lat: number;
  lng: number;
  id: string;
  isFossilOrigin?: boolean;
}

export interface FossilAnalysisResult {
  id: string;
  specimenTitle: string; // e.g. "Spinosaurus Aegyptiacus Fossil Tooth"
  taxaName: string; // Formal scientific name e.g. "Spinosaurus aegyptiacus"
  commonName: string; // e.g. "Spinosaurus"
  elementIdentified: string; // e.g. "Conical rostral tooth with enamel fluting"
  confidenceScore: number; // 0 - 100
  confidenceLevel: 'High' | 'Moderate' | 'Tentative';
  fossilCategory: string; // "Vertebrate tooth", "Exoskeleton", "Bone", "Trace fossil", etc.
  visualObservations: string[]; // key visual markers identified by AI vision
  scientificDescription: string; // in-depth description of the fossil
  estimatedAge: string; // e.g. "95 - 100 Million Years Ago"
  geologicalPeriod: string; // e.g. "Late Cretaceous (Cenomanian)"
  geologicalEra: string; // e.g. "Mesozoic"
  primaryFormation: {
    name: string;
    locationName: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    environment: string;
    age: string;
  };
  alternativeSites: Array<{
    name: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    notes: string;
  }>;
  preservationQuality: string;
  collectorCareGuide: string;
  userPhotoUrl: string;
  userNotes?: string;
  timestamp: number;
}

export interface PaleoStat {
  label: string;
  value: string;
  subtext: string;
  iconType: 'era' | 'geology' | 'discovery' | 'status';
}

export interface PaleoFeature {
  name: string;
  description: string;
  category: 'skull' | 'skeleton' | 'footprint' | 'environment';
}

// Added missing MapStyleConfig interface used in constants.ts for Google Maps styling
export interface MapStyleConfig {
  featureType?: string;
  elementType?: string;
  stylers: Array<{ [key: string]: string | number | boolean }>;
}
