import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Property } from "@shared/schema";
import { getPropertyIcon } from "@/lib/mapUtils";

interface LeafletMapProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  highlightedProperties?: number[];
}

export default function LeafletMap({ 
  properties, 
  onPropertySelect, 
  highlightedProperties = [] 
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Sathorn district
    const map = L.map(mapRef.current).setView([13.7210, 100.5340], 15);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const currentMarkers = markersRef.current;

    // Clear existing markers
    currentMarkers.forEach(marker => {
      map.removeLayer(marker);
    });
    currentMarkers.clear();

    // Add new markers
    properties.forEach(property => {
      const lat = parseFloat(property.lat);
      const lng = parseFloat(property.lng);
      
      if (isNaN(lat) || isNaN(lng)) return;

      const isHighlighted = highlightedProperties.includes(property.id);
      const icon = getPropertyIcon(property.type, isHighlighted);
      
      const marker = L.marker([lat, lng], { icon }).addTo(map);

      // Create popup content
      const popupContent = `
        <div class="p-3 min-w-[220px]">
          <h3 class="font-semibold text-gray-800 mb-1 text-sm">${property.name}</h3>
          <p class="text-xs text-gray-600 capitalize mb-2">${property.type} • ${property.area.toLocaleString()} sqm</p>
          <p class="text-sm font-medium text-secondary mb-2">₿${property.pricePerSqm.toLocaleString()}/sqm</p>
          <p class="text-xs text-gray-600 mb-3 line-clamp-2">${property.description}</p>
          <button 
            class="w-full bg-primary text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 transition-colors font-medium"
            onclick="window.selectProperty(${property.id})"
          >
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup'
      });

      marker.on('click', () => {
        onPropertySelect(property);
      });

      currentMarkers.set(property.id, marker);
    });

    // Make property selection available globally for popup buttons
    (window as any).selectProperty = (id: number) => {
      const property = properties.find(p => p.id === id);
      if (property) {
        onPropertySelect(property);
      }
    };

  }, [properties, onPropertySelect, highlightedProperties]);

  // Update marker styles when highlighted properties change
  useEffect(() => {
    const currentMarkers = markersRef.current;
    
    properties.forEach(property => {
      const marker = currentMarkers.get(property.id);
      if (marker) {
        const isHighlighted = highlightedProperties.includes(property.id);
        const icon = getPropertyIcon(property.type, isHighlighted);
        marker.setIcon(icon);
      }
    });
  }, [highlightedProperties, properties]);

  return (
    <div 
      ref={mapRef} 
      className="map-container w-full h-full bg-gray-100"
    />
  );
}
