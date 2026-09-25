
import { GoogleGenAI, Type } from "@google/genai";
import { PaleoData, SiteMarker, FossilAnalysisResult } from "../types";
import { DINOSAUR_DB, DinosaurDatabaseEntry } from "../data/dinosaurData";

const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    throw new Error("API Key not found");
  }
  return key;
};

// In-memory cache to prevent redundant API calls for the same taxa/sites
const blueprintCache: Record<string, string> = {};
const textDataCache: Record<string, DinosaurDatabaseEntry> = {};

/**
 * Generic retry wrapper for API calls to handle quota limits and transient errors.
 */
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 4, initialDelay = 4000): Promise<T> => {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message?.toLowerCase() || "";
      const isQuotaError = errorMsg.includes("429") || error?.status === 429 || errorMsg.includes("exhausted") || errorMsg.includes("quota");
      
      if (isQuotaError && attempt < maxRetries - 1) {
        // Exponential backoff with jitter
        const jitter = Math.random() * 2000;
        const delay = (initialDelay * Math.pow(3, attempt)) + jitter;
        console.warn(`Quota reached (429). Retrying in ${Math.round(delay)}ms (Attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

/**
 * GEMINI API: Fetches live data for a specific dinosaur using Structured Outputs.
 */
export const generateLiveDinosaurData = async (query: string): Promise<DinosaurDatabaseEntry | null> => {
  const normalizedQuery = query.toLowerCase().trim();
  if (textDataCache[normalizedQuery]) {
    return textDataCache[normalizedQuery];
  }

  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const promptConfig = {
      contents: {
        parts: [{
          text: `Act as a highly accurate paleontological database. Provide detailed scientific information for the dinosaur or prehistoric creature: "${query}". Include its taxonomy, a comprehensive scientific summary, specific metadata (diet, threat level, etc.), and all major known fossil sites where it has been discovered (must be factually true, with a minimum of 5 sites). For each site, include highly specific geographic coordinates, geological context, inventory of features (skulls, footprints, etc.), and stats.`
        }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The formalized taxon name." },
            summary: { type: Type.STRING, description: "A detailed scientific summary of the creature." },
            metadata: {
              type: Type.OBJECT,
              properties: {
                threatLevel: { type: Type.STRING },
                threatScore: { type: Type.INTEGER, description: "1-5 scale" },
                diet: { type: Type.STRING },
                packBehavior: { type: Type.STRING },
                integument: { type: Type.STRING },
                flight: { type: Type.STRING },
                osteologicalCompleteness: { type: Type.INTEGER, description: "0-100 percentage" }
              },
              required: ["threatLevel", "threatScore", "diet", "packBehavior", "integument", "flight", "osteologicalCompleteness"]
            },
            sites: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the fossil site or formation" },
                  coordinates: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER }
                    },
                    required: ["lat", "lng"]
                  },
                  geologicalContext: {
                    type: Type.OBJECT,
                    properties: {
                      era: { type: Type.STRING },
                      period: { type: Type.STRING },
                      climate: { type: Type.STRING },
                      age: { type: Type.STRING }
                    },
                    required: ["era", "period", "climate", "age"]
                  },
                  inventory: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        category: { type: Type.STRING, enum: ["skull", "skeleton", "footprint", "environment"] }
                      },
                      required: ["name", "description", "category"]
                    }
                  },
                  stats: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING },
                        subtext: { type: Type.STRING },
                        iconType: { type: Type.STRING, enum: ["era", "geology", "discovery", "status"] }
                      },
                      required: ["label", "value", "subtext", "iconType"]
                    }
                  }
                },
                required: ["name", "coordinates", "geologicalContext", "inventory", "stats"]
              }
            }
          },
          required: ["name", "summary", "metadata", "sites"]
        }
      }
    };

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'models/gemini-3.8-flash',
        ...promptConfig
      });
    } catch (err) {
      console.warn("models/gemini-3.8-flash attempt failed, falling back to gemini-2.5-flash:", err);
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        ...promptConfig
      });
    }

    const resultText = response.text;
    if (resultText) {
      try {
        const parsed = JSON.parse(resultText) as DinosaurDatabaseEntry;
        textDataCache[normalizedQuery] = parsed;
        return parsed;
      } catch (e) {
        console.error("Failed to parse Gemini response as JSON", e);
      }
    }
    return null;
  });
};

/**
 * GEMINI API (with local fallback): Finds site markers for a specific dinosaur.
 */
export const fetchSitesForQuery = async (query: string): Promise<SiteMarker[]> => {
  let dino = null;
  try {
    dino = await generateLiveDinosaurData(query);
  } catch (err) {
    console.error("Live data fetch failed, using fallback", err);
  }
  
  if (!dino) {
    dino = DINOSAUR_DB.find(d => d.name.toLowerCase() === query.toLowerCase().trim()) || null;
  }
  
  if (!dino) return [];
  
  return dino.sites.map((site, index) => ({
    name: site.name,
    lat: site.coordinates.lat,
    lng: site.coordinates.lng,
    id: `${dino.name.replace(/\s/g, '-')}-${index}`
  }));
};

/**
 * GEMINI API (with local fallback): Retrieves full PaleoData for a site/dino combo.
 */
export const fetchPaleoData = async (siteName: string, speciesName: string): Promise<PaleoData | null> => {
  let dino = null;
  try {
    dino = await generateLiveDinosaurData(speciesName);
  } catch (err) {
    console.error("Live data fetch failed, using fallback", err);
  }
  
  if (!dino) {
    dino = DINOSAUR_DB.find(d => d.name.toLowerCase() === speciesName.toLowerCase().trim()) || null;
  }

  if (!dino) return null;
  
  const site = dino.sites.find(s => s.name === siteName) || dino.sites[0];
  
  return {
    name: site.name,
    coordinates: site.coordinates,
    summary: dino.summary,
    geologicalContext: site.geologicalContext,
    stats: site.stats,
    metadata: dino.metadata,
    features: site.inventory
  };
};

/**
 * GEMINI API: Generates a technical scientific illustration.
 */
export const generateTaxaBlueprint = async (taxaName: string): Promise<string | null> => {
  if (blueprintCache[taxaName]) {
    return blueprintCache[taxaName];
  }

  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: `A highly accurate, scientifically-detailed photorealistic depiction of a single ${taxaName}, shown in full-body profile. The dinosaur exhibits realistic, anatomically correct skin textures, scales, and natural organic colorations based on modern paleontological reconstructions. Set against a completely plain, solid white #ffffff background with no textures, shadows, or environment. No text, labels, or scale figures.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Data = `data:image/png;base64,${part.inlineData.data}`;
        blueprintCache[taxaName] = base64Data;
        return base64Data;
      }
    }
    return null;
  });
};

/**
 * GEMINI VISION API: Analyzes an uploaded photo of a fossil from a user's collection,
 * describes the specimen, identifies the prehistoric creature, and locates the exact
 * geological formation & geographical coordinates where it was found!
 */
export const analyzeFossilPhoto = async (
  photoDataUrl: string,
  userHint?: string
): Promise<{ result: FossilAnalysisResult; paleoData: PaleoData; markers: SiteMarker[] }> => {
  return withRetry(async () => {
    // 1. Parse MIME type and clean Base64 data from URL
    let mimeType = "image/jpeg";
    let base64Data = photoDataUrl;
    if (photoDataUrl.startsWith("data:")) {
      const commaIndex = photoDataUrl.indexOf(",");
      if (commaIndex !== -1) {
        const header = photoDataUrl.substring(5, commaIndex);
        const mimeMatch = header.match(/^([^;]+)/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
        base64Data = photoDataUrl.substring(commaIndex + 1);
      }
    }

    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const promptText = `You are a world-renowned paleontologist, taphonomist, and fossil provenance analyst.
Examine this user-submitted photo of a genuine fossil specimen from a private collection.
${userHint ? `Collector Note / Clue provided: "${userHint}"` : ""}

Conduct a comprehensive scientific appraisal:
1. Identify the likely prehistoric organism (genus & species if discernible, or higher taxon), common name, and anatomical element (e.g. shed maxillary tooth, ammonite phragmocone shell, trilobite dorsal exoskeleton, theropod caudal vertebra, tooth crown).
2. Pinpoint the primary geological formation and geographical coordinates (latitude and longitude) where this fossil was originally excavated/found (e.g. Kem Kem Beds in Morocco, Hell Creek in Montana, Solnhofen Limestone in Germany, Wheeler Shale in Utah, Peace River in Florida, etc.).
3. Provide at least 2 other renowned fossil sites globally where this taxon or related specimens have been uncovered.
4. Highlight 3-5 distinct visual diagnostic observations visible in this specimen photo (e.g. enamel fluting, serration density, matrix rock color, suture lines, mineralization, patina, fracture/cleavage planes).
5. Give an in-depth scientific description of the animal/organism and its taphonomic context.
6. Provide expert preservation quality appraisal and collector storage/care guidelines.

Output purely structured JSON adhering to the specified schema.`;

    const promptConfig = {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: promptText
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            specimenTitle: { type: Type.STRING, description: "Engaging title e.g. 'Spinosaurus Aegyptiacus Fossil Tooth'" },
            taxaName: { type: Type.STRING, description: "Formal scientific species or genus name" },
            commonName: { type: Type.STRING, description: "Common name e.g. 'Spinosaurus'" },
            elementIdentified: { type: Type.STRING, description: "Specific anatomical element identified" },
            confidenceScore: { type: Type.INTEGER, description: "1-100 confidence percentage" },
            confidenceLevel: { type: Type.STRING, description: "High, Moderate, or Tentative" },
            fossilCategory: { type: Type.STRING, description: "Category e.g. Vertebrate tooth, Skeletal bone, Cephalopod, Exoskeleton" },
            visualObservations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 5 specific visual diagnostic features spotted in the photo"
            },
            scientificDescription: { type: Type.STRING, description: "Comprehensive scientific analysis of the specimen" },
            estimatedAge: { type: Type.STRING, description: "e.g. '99 - 95 Million Years Ago'" },
            geologicalPeriod: { type: Type.STRING, description: "e.g. 'Late Cretaceous (Cenomanian)'" },
            geologicalEra: { type: Type.STRING, description: "e.g. 'Mesozoic'" },
            primaryFormation: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Formation name e.g. 'Kem Kem Beds'" },
                locationName: { type: Type.STRING, description: "Specific digging region e.g. 'Taouz, Drâa-Tafilalet'" },
                country: { type: Type.STRING, description: "Country e.g. 'Morocco'" },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER, description: "Latitude coordinate" },
                    lng: { type: Type.NUMBER, description: "Longitude coordinate" }
                  },
                  required: ["lat", "lng"]
                },
                environment: { type: Type.STRING, description: "Paleoenvironment during deposition" },
                age: { type: Type.STRING, description: "Age range" }
              },
              required: ["name", "locationName", "country", "coordinates", "environment", "age"]
            },
            alternativeSites: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  country: { type: Type.STRING },
                  coordinates: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER }
                    },
                    required: ["lat", "lng"]
                  },
                  notes: { type: Type.STRING }
                },
                required: ["name", "country", "coordinates", "notes"]
              }
            },
            preservationQuality: { type: Type.STRING, description: "Preservation grade and condition assessment" },
            collectorCareGuide: { type: Type.STRING, description: "Collector tips for storage, cleaning, and climate control" },
            threatLevel: { type: Type.STRING },
            diet: { type: Type.STRING },
            packBehavior: { type: Type.STRING },
            integument: { type: Type.STRING },
            flight: { type: Type.STRING },
            osteologicalCompleteness: { type: Type.INTEGER }
          },
          required: [
            "specimenTitle",
            "taxaName",
            "commonName",
            "elementIdentified",
            "confidenceScore",
            "confidenceLevel",
            "fossilCategory",
            "visualObservations",
            "scientificDescription",
            "estimatedAge",
            "geologicalPeriod",
            "geologicalEra",
            "primaryFormation",
            "alternativeSites",
            "preservationQuality",
            "collectorCareGuide"
          ]
        }
      }
    };

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        ...promptConfig
      });
    } catch (err) {
      console.warn("gemini-3.8-flash analysis failed, falling back to gemini-2.5-flash:", err);
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        ...promptConfig
      });
    }

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text returned from Gemini API");
    }

    const parsed = JSON.parse(resultText);

    // Build the FossilAnalysisResult
    const result: FossilAnalysisResult = {
      id: `fossil-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      specimenTitle: parsed.specimenTitle || "Identified Fossil Specimen",
      taxaName: parsed.taxaName || "Prehistoric Taxon",
      commonName: parsed.commonName || parsed.taxaName || "Specimen",
      elementIdentified: parsed.elementIdentified || "Fossilized Specimen Element",
      confidenceScore: typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : 92,
      confidenceLevel: (parsed.confidenceLevel as any) || "High",
      fossilCategory: parsed.fossilCategory || "Fossil Specimen",
      visualObservations: parsed.visualObservations || [],
      scientificDescription: parsed.scientificDescription || "",
      estimatedAge: parsed.estimatedAge || "Prehistoric Age",
      geologicalPeriod: parsed.geologicalPeriod || "Mesozoic",
      geologicalEra: parsed.geologicalEra || "Mesozoic",
      primaryFormation: {
        name: parsed.primaryFormation.name,
        locationName: parsed.primaryFormation.locationName,
        country: parsed.primaryFormation.country,
        coordinates: {
          lat: Number(parsed.primaryFormation.coordinates.lat) || 0,
          lng: Number(parsed.primaryFormation.coordinates.lng) || 0
        },
        environment: parsed.primaryFormation.environment || "Ancient paleo-ecosystem",
        age: parsed.primaryFormation.age || parsed.estimatedAge
      },
      alternativeSites: (parsed.alternativeSites || []).map((s: any) => ({
        name: s.name,
        country: s.country,
        coordinates: {
          lat: Number(s.coordinates?.lat) || 0,
          lng: Number(s.coordinates?.lng) || 0
        },
        notes: s.notes || ""
      })),
      preservationQuality: parsed.preservationQuality || "Well-preserved mineralized specimen",
      collectorCareGuide: parsed.collectorCareGuide || "Keep away from excessive humidity and direct UV light.",
      userPhotoUrl: photoDataUrl,
      userNotes: userHint,
      timestamp: Date.now()
    };

    // Build map SiteMarkers with primary origin highlighted
    const primaryMarker: SiteMarker = {
      name: `${result.primaryFormation.name} (${result.primaryFormation.country})`,
      lat: result.primaryFormation.coordinates.lat,
      lng: result.primaryFormation.coordinates.lng,
      id: `marker-origin-${result.id}`,
      isFossilOrigin: true
    };

    const altMarkers: SiteMarker[] = result.alternativeSites.map((s, i) => ({
      name: `${s.name} (${s.country})`,
      lat: s.coordinates.lat,
      lng: s.coordinates.lng,
      id: `marker-alt-${i}-${result.id}`,
      isFossilOrigin: false
    }));

    const markers: SiteMarker[] = [primaryMarker, ...altMarkers];

    // Build PaleoData so standard map & field journal features populate seamlessly
    const paleoData: PaleoData = {
      name: primaryMarker.name,
      coordinates: result.primaryFormation.coordinates,
      summary: result.scientificDescription,
      geologicalContext: {
        era: result.geologicalEra,
        period: result.geologicalPeriod,
        climate: result.primaryFormation.environment,
        age: result.estimatedAge
      },
      stats: [
        {
          label: "Specimen Element",
          value: result.elementIdentified,
          subtext: result.fossilCategory,
          iconType: "discovery"
        },
        {
          label: "Geological Era",
          value: result.geologicalEra,
          subtext: result.geologicalPeriod,
          iconType: "era"
        },
        {
          label: "Formation Origin",
          value: result.primaryFormation.name,
          subtext: `${result.primaryFormation.locationName}, ${result.primaryFormation.country}`,
          iconType: "geology"
        },
        {
          label: "Identification Match",
          value: `${result.confidenceScore}% (${result.confidenceLevel})`,
          subtext: result.preservationQuality,
          iconType: "status"
        }
      ],
      features: result.visualObservations.map((obs, idx) => ({
        name: `Diagnostic Clue #${idx + 1}`,
        description: obs,
        category: "skull"
      })),
      metadata: {
        threatLevel: parsed.threatLevel || "Apex Predator",
        threatScore: 4,
        diet: parsed.diet || "Carnivorous / Piscivorous",
        packBehavior: parsed.packBehavior || "Solitary / Territorial",
        integument: parsed.integument || "Enamel / Skeletal mineralization",
        flight: parsed.flight || "Non-flighted",
        osteologicalCompleteness: parsed.osteologicalCompleteness || 85
      }
    };

    return { result, paleoData, markers };
  });
};
