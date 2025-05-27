import L from "leaflet";

interface PropertyMarkerProps {
  type: "office" | "residential" | "restaurant";
  highlighted?: boolean;
}

export function createPropertyMarker({ type, highlighted = false }: PropertyMarkerProps): L.DivIcon {
  const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all duration-200";
  const highlightClasses = highlighted ? "w-10 h-10 ring-4 ring-yellow-400 ring-opacity-60" : "";
  
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

  const config = typeConfig[type];
  
  return L.divIcon({
    html: `
      <div class="${baseClasses} ${config.bgColor} ${highlightClasses}">
        <span class="text-white text-xs">${config.icon}</span>
      </div>
    `,
    className: 'custom-marker',
    iconSize: highlighted ? [40, 40] : [32, 32],
    iconAnchor: highlighted ? [20, 20] : [16, 16]
  });
}
