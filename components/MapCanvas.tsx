import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { SiteMarker } from '../types';
import { Plus, Minus, Compass, Layers, RefreshCw, Sparkles, Map as MapIcon, Globe, Mountain, Check, Compass as PhysicalIcon } from 'lucide-react';

export type MapStyle = 'natgeo' | 'physical' | 'topo' | 'satellite' | 'atlas-hd';

interface MapLayerConfig {
  id: MapStyle;
  name: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  getUrl: (upscale: boolean, timestamp: number) => string;
  options: L.TileLayerOptions;
  overlayUrl?: string;
  overlayOptions?: L.TileLayerOptions;
}

const MAP_LAYERS: Record<MapStyle, MapLayerConfig> = {
  'natgeo': {
    id: 'natgeo',
    name: 'National Geographic Atlas',
    badge: 'Vintage 4K',
    desc: 'Original National Geographic printed world atlas with warm antique paper & bathymetry',
    icon: Layers,
    getUrl: (_upscale: boolean, ts: number) => 
      `https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}?ts=${ts}`,
    options: {
      maxZoom: 16,
      maxNativeZoom: 16,
      attribution: 'National Geographic, Esri'
    }
  },
  'physical': {
    id: 'physical',
    name: 'World Physical Relief',
    badge: 'Clean Relief',
    desc: 'Pure geological & tectonic landforms, plate boundaries, and mountain ranges without lines',
    icon: PhysicalIcon,
    getUrl: (_upscale: boolean, ts: number) => 
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}?ts=${ts}`,
    options: {
      maxZoom: 9,
      maxNativeZoom: 8,
      attribution: 'Esri, U.S. National Park Service'
    }
  },
  'topo': {
    id: 'topo',
    name: 'Topographic Shading',
    badge: 'Elevation HD',
    desc: 'Contour lines, elevation shading, and prehistoric terrain landforms',
    icon: Mountain,
    getUrl: (_upscale: boolean, ts: number) => 
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}?ts=${ts}`,
    options: {
      maxZoom: 19,
      maxNativeZoom: 18,
      attribution: 'Esri, HERE, Garmin, USGS'
    }
  },
  'satellite': {
    id: 'satellite',
    name: 'Satellite 4K',
    badge: 'Orbital HD',
    desc: 'High-resolution photorealistic satellite view with national boundaries',
    icon: Globe,
    getUrl: (_upscale: boolean, ts: number) => 
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?ts=${ts}`,
    options: {
      maxZoom: 19,
      maxNativeZoom: 18,
      attribution: 'Esri, Maxar, Earthstar Geographics'
    },
    overlayUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    overlayOptions: {
      maxZoom: 19,
      maxNativeZoom: 18,
      opacity: 0.85
    }
  },
  'atlas-hd': {
    id: 'atlas-hd',
    name: 'Modern Vector Atlas',
    badge: '@2x Retina',
    desc: 'Clean modern cartography with crisp high-DPI coastlines',
    icon: MapIcon,
    getUrl: (upscale: boolean, ts: number) => 
      `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}${upscale ? '@2x' : ''}.png?ts=${ts}`,
    options: {
      subdomains: 'abcd',
      maxZoom: 20,
      maxNativeZoom: 19,
      attribution: '&copy; OpenStreetMap, &copy; CARTO'
    }
  }
};

interface MapCanvasProps {
  markers: SiteMarker[];
  selectedMarkerId?: string;
  onMarkerClick: (marker: SiteMarker) => void;
  activeTaxaName?: string;
  fossilSpecimenTitle?: string;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ 
  markers, 
  selectedMarkerId, 
  onMarkerClick,
  activeTaxaName = "Dinosauria",
  fossilSpecimenTitle
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayersRef = useRef<L.TileLayer[]>([]);
  
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>('natgeo');
  const [isUpscaled, setIsUpscaled] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [reloadNotice, setReloadNotice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(Date.now());

  // Find selected marker and fossil origin marker
  const selectedMarker = useMemo(() => {
    return markers.find(m => m.name === selectedMarkerId) || markers[0];
  }, [markers, selectedMarkerId]);

  const fossilOriginMarker = useMemo(() => {
    return markers.find(m => m.isFossilOrigin);
  }, [markers]);

  // Apply Tile Layers based on mapStyle, isUpscaled, and reloadKey
  const updateTileLayers = useCallback((map: L.Map) => {
    // Remove existing tile layers
    tileLayersRef.current.forEach(layer => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    tileLayersRef.current = [];

    const config = MAP_LAYERS[mapStyle] || MAP_LAYERS['natgeo'];
    const url = config.getUrl(isUpscaled, reloadKey);

    const baseLayer = L.tileLayer(url, {
      ...config.options,
      detectRetina: isUpscaled,
      updateWhenIdle: false,
      updateWhenZooming: false, // Prevents seam artifacts during zoom animations
      keepBuffer: 6
    }).addTo(map);

    tileLayersRef.current.push(baseLayer);

    // If layer has an overlay (e.g. place names for satellite)
    if (config.overlayUrl) {
      const overlayLayer = L.tileLayer(config.overlayUrl, {
        ...config.overlayOptions,
        detectRetina: isUpscaled,
        updateWhenZooming: false
      }).addTo(map);
      tileLayersRef.current.push(overlayLayer);
    }
  }, [mapStyle, isUpscaled, reloadKey]);

  // Initialize solid printed map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28, 5],
        zoom: 3,
        minZoom: 2,
        maxZoom: 16,
        zoomSnap: 1, // Locks to exact integer zoom levels to eliminate subpixel seam lines
        zoomDelta: 1,
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: true,
        inertia: true,
        inertiaDeceleration: 3000
      });

      // Layer group for physical pushpins
      const layerGroup = L.layerGroup().addTo(map);
      markerLayerGroupRef.current = layerGroup;

      mapInstanceRef.current = map;

      map.on('dragstart', () => setIsGrabbing(true));
      map.on('dragend', () => setIsGrabbing(false));
    }

    const map = mapInstanceRef.current;
    if (map) {
      updateTileLayers(map);
      map.invalidateSize(true);
    }

    // Auto resize observer for big screens and window resizing
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layers when mapStyle, upscale, or reloadKey changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateTileLayers(mapInstanceRef.current);
    }
  }, [updateTileLayers]);

  // Reload map & upscale action
  const handleReloadMap = () => {
    setIsReloading(true);
    const newKey = Date.now();
    setReloadKey(newKey);
    
    if (mapInstanceRef.current) {
      // Invalidate tile cache and trigger clean redraw
      mapInstanceRef.current.invalidateSize(true);
      tileLayersRef.current.forEach(layer => layer.redraw());
    }

    setReloadNotice(`Map reloaded in Ultra-HD (${isUpscaled ? 'Retina Super-Resolution' : 'Standard 1x'})`);
    
    setTimeout(() => {
      setIsReloading(false);
    }, 600);

    setTimeout(() => {
      setReloadNotice(null);
    }, 3200);
  };

  // Toggle Upscale Resolution (1x vs Retina / 4K)
  const handleToggleUpscale = () => {
    const nextUpscaled = !isUpscaled;
    setIsUpscaled(nextUpscaled);
    handleReloadMap();
  };

  // Update Printed Map Pushpins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markerLayerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    if (markers.length === 0) return;

    markers.forEach((marker, index) => {
      const isSelected = marker.name === selectedMarkerId || marker.id === selectedMarker?.id;
      const isOrigin = !!marker.isFossilOrigin;

      const pinColor = isOrigin ? '#d97706' : isSelected ? '#dc2626' : '#2563eb';
      const pinBorder = isOrigin ? '#78350f' : isSelected ? '#991b1b' : '#1e40af';
      const size = isSelected ? 34 : isOrigin ? 32 : 26;

      // Realistic physical map pushpin with paper drop shadow
      const pinHtml = `
        <div style="position: relative; width: ${size}px; height: ${size + 14}px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <!-- Paper Shadow -->
          <div style="
            position: absolute;
            bottom: 0px;
            left: 50%;
            transform: translateX(-50%);
            width: ${size * 0.75}px;
            height: 6px;
            background: radial-gradient(ellipse at center, rgba(30, 20, 10, 0.45) 0%, rgba(0,0,0,0) 70%);
            border-radius: 50%;
            pointer-events: none;
          "></div>

          <!-- Printed Pushpin Head -->
          <div style="
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: radial-gradient(circle at 35% 35%, #ffffff 0%, ${pinColor} 55%, ${pinBorder} 100%);
            border: 2px solid #ffffff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.35), inset 0 -2px 4px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: ${isSelected ? 11 : 9}px;
            font-weight: 800;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            transition: transform 0.15s ease;
            transform: ${isSelected ? 'scale(1.15) translateY(-2px)' : 'scale(1)'};
          ">
            ${isOrigin ? '★' : index + 1}
          </div>

          <!-- Needle Pin Shaft -->
          <div style="
            width: 2px;
            height: 10px;
            background: linear-gradient(to bottom, #d1d5db, #6b7280);
            box-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          "></div>

          <!-- Origin Flag if Specimen Origin -->
          ${isOrigin ? `
            <div style="
              position: absolute;
              top: -20px;
              left: 50%;
              transform: translateX(-50%);
              background: #92400e;
              color: #fef3c7;
              font-size: 8px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-weight: 800;
              letter-spacing: 0.5px;
              padding: 1.5px 6px;
              border-radius: 4px;
              white-space: nowrap;
              border: 1px solid #fef3c7;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              pointer-events: none;
            ">
              ORIGIN
            </div>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: pinHtml,
        className: 'printed-map-pin',
        iconSize: [size, size + 14],
        iconAnchor: [size / 2, size + 14],
        popupAnchor: [0, -size - 10]
      });

      const markerInstance = L.marker([marker.lat, marker.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : isOrigin ? 800 : 100
      });

      markerInstance.on('click', () => {
        onMarkerClick(marker);
      });

      layerGroup.addLayer(markerInstance);
    });
  }, [markers, selectedMarkerId, selectedMarker, onMarkerClick]);

  // Center camera when selected marker changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || markers.length === 0) return;

    if (selectedMarker) {
      map.flyTo([selectedMarker.lat, selectedMarker.lng], Math.max(map.getZoom(), 4), {
        animate: true,
        duration: 1
      });
    } else {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5, animate: true });
    }
  }, [selectedMarkerId, markers.length]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (selectedMarker) {
      map.flyTo([selectedMarker.lat, selectedMarker.lng], 5, { animate: true, duration: 0.8 });
    } else if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
    } else {
      map.flyTo([28, 5], 3, { animate: true, duration: 0.8 });
    }
  };

  const activeLayerConfig = MAP_LAYERS[mapStyle];

  return (
    <div className={`relative w-full h-full select-none overflow-hidden bg-[#99b6c1] ${isGrabbing ? 'cursor-grabbing' : 'cursor-grab'}`}>
      
      {/* Printed Paper Edge Border & Shadow */}
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_20px_rgba(40,50,60,0.22)] border border-[#8faab5]"></div>

      {/* Solid High-Resolution Map Surface */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Temporary Reload / Resolution Toast */}
      {reloadNotice && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-park-tree text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-park-tree/40 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>{reloadNotice}</span>
        </div>
      )}

      {/* Top Left: Active Specimen Origin Tag */}
      {fossilOriginMarker && (
        <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-20 pointer-events-auto bg-[#faf7f0]/95 border border-[#c4b59d] text-[#453624] px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg shadow-md flex items-center gap-1.5 sm:gap-2 backdrop-blur-xs max-w-[48vw] sm:max-w-none">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#d97706] text-white flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0">
            ★
          </div>
          <div className="text-[10px] sm:text-xs font-semibold truncate min-w-0">
            <span className="font-bold text-[#92400e] hidden xs:inline">Origin: </span>
            <span className="truncate">{fossilOriginMarker.name}</span>
          </div>
          <button
            onClick={() => onMarkerClick(fossilOriginMarker)}
            className="ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 bg-[#92400e] hover:bg-[#78350f] text-white rounded text-[9px] sm:text-[10px] font-bold transition-colors cursor-pointer shrink-0"
          >
            Locate
          </button>
        </div>
      )}

      {/* Top Right: Layer Switcher & Resolution Controls */}
      <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Upscale / Resolution Badge & Toggle */}
        <button
          onClick={handleToggleUpscale}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold shadow-md border transition-all cursor-pointer ${
            isUpscaled 
              ? 'bg-park-tree text-amber-300 border-park-tree/60 shadow-amber-900/10' 
              : 'bg-[#faf7f0] text-park-ink-muted border-[#c4b59d] hover:bg-white'
          }`}
          title={isUpscaled ? 'Map is running in Ultra-HD Retina resolution (Click to toggle standard)' : 'Click to enable Ultra-HD Retina upscaling'}
        >
          <Sparkles className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isUpscaled ? 'text-amber-400' : 'text-park-ink-muted'}`} />
          <span className="hidden sm:inline font-mono text-[11px]">{isUpscaled ? 'Ultra-HD @2x' : 'Standard 1x'}</span>
          <span className="sm:hidden font-mono text-[10px]">{isUpscaled ? 'HD' : '1x'}</span>
        </button>

        {/* Reload Map Tile Button */}
        <button
          onClick={handleReloadMap}
          disabled={isReloading}
          className="w-7 h-7 sm:w-8 sm:h-8 bg-[#faf7f0] hover:bg-white text-park-tree rounded-lg shadow-md border border-[#c4b59d] flex items-center justify-center transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          title="Reload Map Tiles & Clear Seams"
        >
          <RefreshCw size={13} className={isReloading ? 'animate-spin text-amber-600' : ''} />
        </button>

        {/* Map Layers Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#faf7f0] hover:bg-white text-park-tree rounded-lg shadow-md border border-[#c4b59d] text-xs font-bold transition-all cursor-pointer active:scale-95"
            title="Switch Map Cartography Style"
          >
            <Layers size={13} className="text-park-tree" />
            <span className="hidden md:inline font-rounded">{activeLayerConfig.name}</span>
          </button>

          {/* Layer Menu Popup */}
          {showLayerMenu && (
            <div 
              className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-[#faf7f0] border border-[#c4b59d] rounded-xl shadow-xl p-1.5 sm:p-2 z-30 flex flex-col gap-1 backdrop-blur-md"
              onMouseLeave={() => setShowLayerMenu(false)}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-park-ink-muted px-2 py-1 border-b border-[#e5dfcf]">
                Cartographic Atlas Style
              </div>
              {(Object.keys(MAP_LAYERS) as MapStyle[]).map((key) => {
                const layer = MAP_LAYERS[key];
                const IconComponent = layer.icon;
                const isSelected = mapStyle === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setMapStyle(key);
                      setShowLayerMenu(false);
                    }}
                    className={`flex items-start gap-2 p-1.5 sm:p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-park-land/30 border border-park-border-green/50 text-park-tree' 
                        : 'hover:bg-white text-park-ink'
                    }`}
                  >
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-park-tree text-white' : 'bg-[#e8e2d4] text-park-tree'
                    }`}>
                      <IconComponent size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-rounded truncate">{layer.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 font-semibold border border-amber-500/20 shrink-0">
                          {layer.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-park-ink-muted mt-0.5 leading-snug line-clamp-2">
                        {layer.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-park-tree shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Discrete Corner Zoom & Center Controls */}
      <div className="absolute bottom-28 sm:bottom-5 right-2.5 sm:right-5 z-20 flex flex-col gap-1 sm:gap-1.5 pointer-events-auto">
        <button
          onClick={handleRecenter}
          className="w-7 h-7 sm:w-8 sm:h-8 bg-[#faf7f0] hover:bg-white text-[#453624] rounded-md shadow-md border border-[#c4b59d] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Center on Selected Site"
        >
          <Compass size={15} />
        </button>
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 sm:w-8 sm:h-8 bg-[#faf7f0] hover:bg-white text-[#453624] rounded-md shadow-md border border-[#c4b59d] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Zoom In"
        >
          <Plus size={15} />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-7 h-7 sm:w-8 sm:h-8 bg-[#faf7f0] hover:bg-white text-[#453624] rounded-md shadow-md border border-[#c4b59d] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Zoom Out"
        >
          <Minus size={15} />
        </button>
      </div>

      {/* Bottom Left: Printed Atlas Tag & Resolution Specs */}
      <div className="absolute bottom-2 left-3 z-20 pointer-events-none text-[10px] font-serif text-[#455860] opacity-90 hidden sm:flex items-center gap-2">
        <span>{activeLayerConfig.name} • {isUpscaled ? 'Ultra-HD @2x' : 'Standard 1x'}</span>
        <span>•</span>
        <span>Grab to pan, scroll to zoom</span>
      </div>
    </div>
  );
};

export default MapCanvas;
