import { useState } from "react";
import LeafletMap from "@/components/map/LeafletMap";
import SearchBar from "@/components/SearchBar";
import PropertySidebar from "@/components/PropertySidebar";
import PropertyModal from "@/components/PropertyModal";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import AIResponsePanel from "@/components/AIResponsePanel";
import { Button } from "@/components/ui/button";
import { BarChart3, Menu, X } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import type { Property, PropertyFilter } from "@shared/schema";

export default function MapPage() {
  const { data: properties, isLoading } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [aiResponse, setAIResponse] = useState<{
    query: string;
    response: string;
    relevantPropertyIds: number[];
  } | null>(null);
  const [filters, setFilters] = useState<PropertyFilter>({});
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleAIResponse = (response: {
    query: string;
    response: string;
    relevantPropertyIds: number[];
  }) => {
    setAIResponse(response);
    
    // Highlight relevant properties on map
    if (properties && response.relevantPropertyIds.length > 0) {
      const relevant = properties.filter(p => 
        response.relevantPropertyIds.includes(p.id)
      );
      setFilteredProperties(relevant);
    }
  };

  const handleFilterChange = (newFilters: PropertyFilter) => {
    setFilters(newFilters);
    
    if (!properties) return;
    
    let filtered = [...properties];
    
    if (newFilters.types && newFilters.types.length > 0) {
      filtered = filtered.filter(p => newFilters.types!.includes(p.type as any));
    }
    
    if (newFilters.priceMin !== undefined) {
      filtered = filtered.filter(p => p.pricePerSqm >= newFilters.priceMin!);
    }
    
    if (newFilters.priceMax !== undefined) {
      filtered = filtered.filter(p => p.pricePerSqm <= newFilters.priceMax!);
    }
    
    if (newFilters.areaMin !== undefined) {
      filtered = filtered.filter(p => p.area >= newFilters.areaMin!);
    }
    
    if (newFilters.areaMax !== undefined) {
      filtered = filtered.filter(p => p.area <= newFilters.areaMax!);
    }
    
    if (newFilters.nearBts && newFilters.nearBts.length > 0) {
      filtered = filtered.filter(p => 
        p.nearestBts && newFilters.nearBts!.includes(p.nearestBts)
      );
    }
    
    setFilteredProperties(filtered);
  };

  const clearFilters = () => {
    setFilters({});
    setFilteredProperties([]);
    setAIResponse(null);
  };

  const displayProperties = filteredProperties.length > 0 ? filteredProperties : properties || [];

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="loading-pulse text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading Sathorn properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gray-50">
      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-2xl px-4">
        <SearchBar onAIResponse={handleAIResponse} />
        
        {/* Demo Quick Queries */}
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {[
            "Show me restaurants near Empire Tower",
            "Find luxury residential properties above ₿500K/sqm",
            "What are the best office spaces with BTS access?",
            "Compare rooftop restaurants in Sathorn"
          ].map((query, index) => (
            <button
              key={index}
              onClick={() => {
                const searchEvent = new CustomEvent('demoQuery', { detail: query });
                document.dispatchEvent(searchEvent);
              }}
              className="px-3 py-1.5 bg-white/90 hover:bg-white text-xs text-gray-600 hover:text-primary rounded-full shadow-sm border border-gray-200 hover:border-primary transition-all duration-200"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="absolute top-4 left-4 z-[1001] md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSidebar(!showSidebar)}
          className="bg-white shadow-lg"
        >
          {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`absolute left-4 top-20 bottom-4 z-[999] w-80 transition-transform duration-300 ${
        showSidebar ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <PropertySidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          properties={properties || []}
        />
      </div>

      {/* Map */}
      <div className="w-full h-full">
        <LeafletMap
          properties={displayProperties}
          onPropertySelect={handlePropertySelect}
          highlightedProperties={aiResponse?.relevantPropertyIds || []}
        />
      </div>

      {/* Map Controls */}
      <div className="absolute top-20 right-4 z-[999] space-y-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="bg-white shadow-lg"
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </div>

      {/* Analytics Toggle Button */}
      {!showAnalytics && (
        <div className="absolute bottom-4 right-4 z-[999]">
          <Button
            onClick={() => setShowAnalytics(true)}
            className="bg-primary text-white shadow-lg hover:bg-blue-700"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      )}

      {/* AI Response Panel */}
      {aiResponse && (
        <AIResponsePanel
          query={aiResponse.query}
          response={aiResponse.response}
          onClose={() => setAIResponse(null)}
        />
      )}

      {/* Property Modal */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />
      )}
    </div>
  );
}
