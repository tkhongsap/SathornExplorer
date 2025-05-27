import L from "leaflet";

export function getPropertyIcon(type: string, highlighted: boolean = false): L.DivIcon {
  const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all duration-200";
  const highlightClasses = highlighted ? "w-10 h-10 ring-4 ring-yellow-400 ring-opacity-60 z-[1000]" : "";
  
  const typeConfig = {
    office: {
      bgColor: "bg-office",
      icon: "🏢"
    },
    residential: {
      bgColor: "bg-residential", 
      icon: "🏠"
    },
    restaurant: {
      bgColor: "bg-restaurant",
      icon: "🍽️"
    }
  };

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.office;
  
  return L.divIcon({
    html: `
      <div class="${baseClasses} ${config.bgColor} ${highlightClasses}">
        <span class="text-white text-xs">${config.icon}</span>
      </div>
    `,
    className: 'custom-marker',
    iconSize: highlighted ? [40, 40] : [32, 32],
    iconAnchor: highlighted ? [20, 20] : [16, 16],
    popupAnchor: [0, highlighted ? -20 : -16]
  });
}

export function formatPrice(price: number): string {
  return `₿${price.toLocaleString()}`;
}

export function formatArea(area: number): string {
  return `${area.toLocaleString()} sqm`;
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
}
