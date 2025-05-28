import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Property, PropertyFilter } from "@shared/schema";
import { ChevronDown, ChevronUp, MapPin, Filter, Building, Home, UtensilsCrossed, DollarSign, Square, Trash2, Map, Train } from "lucide-react";

interface PropertySidebarProps {
  filters: PropertyFilter;
  onFilterChange: (filters: PropertyFilter) => void;
  onClearFilters: () => void;
  properties: Property[];
  aiResponse?: {
    query: string;
    response: string;
    relevantPropertyIds: number[];
  } | null;
  onCloseAIResponse?: () => void;
}

export default function PropertySidebar({
  filters,
  onFilterChange,
  onClearFilters,
  properties,
  aiResponse,
  onCloseAIResponse
}: PropertySidebarProps) {
  const [localFilters, setLocalFilters] = useState<PropertyFilter>(filters);
  const [isTypeOpen, setIsTypeOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isAreaOpen, setIsAreaOpen] = useState(true);
  const [isDistrictOpen, setIsDistrictOpen] = useState(true);
  const [isBtsOpen, setIsBtsOpen] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key: keyof PropertyFilter, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const togglePropertyType = (type: "office" | "residential" | "restaurant") => {
    const currentTypes = localFilters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateFilter('types', newTypes);
  };

  const toggleBtsStation = (station: string) => {
    const currentStations = localFilters.nearBts || [];
    const newStations = currentStations.includes(station)
      ? currentStations.filter(s => s !== station)
      : [...currentStations, station];
    updateFilter('nearBts', newStations);
  };

  // Bangkok districts based on property locations
  const districts = [
    { name: "Sathorn", count: properties.filter(p => p.address.includes("Sathorn")).length },
    { name: "Silom", count: properties.filter(p => p.address.includes("Silom") || p.address.includes("Bang Rak")).length },
    { name: "Bang Rak", count: properties.filter(p => p.address.includes("Bang Rak")).length }
  ];

  const btsStations = [
    { name: "Sala Daeng", count: properties.filter(p => p.nearestBts === "Sala Daeng").length },
    { name: "Chong Nonsi", count: properties.filter(p => p.nearestBts === "Chong Nonsi").length },
    { name: "Surasak", count: properties.filter(p => p.nearestBts === "Surasak").length },
    { name: "Saphan Taksin", count: properties.filter(p => p.nearestBts === "Saphan Taksin").length }
  ];

  const propertyTypes = [
    { id: "office", label: "Offices", icon: Building, color: "blue", count: properties.filter(p => p.type === "office").length },
    { id: "residential", label: "Residential", icon: Home, color: "purple", count: properties.filter(p => p.type === "residential").length },
    { id: "restaurant", label: "Restaurants", icon: UtensilsCrossed, color: "red", count: properties.filter(p => p.type === "restaurant").length }
  ];

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.types?.length) count++;
    if (localFilters.priceMin || localFilters.priceMax) count++;
    if (localFilters.areaMin || localFilters.areaMax) count++;
    if (localFilters.nearBts?.length) count++;
    return count;
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <Card className="m-4 shadow-xl border border-gray-200/50 bg-white/98 backdrop-blur-md rounded-xl overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 via-blue-50 to-emerald-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 shadow-sm">
                <Filter className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Property Filters</h3>
                <p className="text-xs text-gray-500">Refine your search results</p>
              </div>
            </div>
            
            {getActiveFilterCount() > 0 && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-medium">
                {getActiveFilterCount()} Active
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Property Type Section */}
          <Collapsible open={isTypeOpen} onOpenChange={setIsTypeOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:bg-blue-100/50 transition-colors">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">Property Type</span>
              </div>
              {isTypeOpen ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-3">
              {propertyTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = localFilters.types?.includes(type.id as any) || false;
                
                return (
                  <div key={type.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={type.id}
                        checked={isSelected}
                        onCheckedChange={() => togglePropertyType(type.id as any)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label
                        htmlFor={type.id}
                        className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                      >
                        <Icon className={`h-4 w-4 text-${type.color}-600`} />
                        {type.label}
                      </Label>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {type.count}
                    </Badge>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          {/* Bangkok Districts Section */}
          <Collapsible open={isDistrictOpen} onOpenChange={setIsDistrictOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:bg-emerald-100/50 transition-colors">
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-emerald-800">Bangkok Districts</span>
              </div>
              {isDistrictOpen ? <ChevronUp className="h-4 w-4 text-emerald-600" /> : <ChevronDown className="h-4 w-4 text-emerald-600" />}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-3">
              {districts.map((district) => (
                <div key={district.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">{district.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                    {district.count}
                  </Badge>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Price Range Section */}
          <Collapsible open={isPriceOpen} onOpenChange={setIsPriceOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100 hover:bg-amber-100/50 transition-colors">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-600" />
                <span className="font-semibold text-amber-800">Price per SQM (THB)</span>
              </div>
              {isPriceOpen ? <ChevronUp className="h-4 w-4 text-amber-600" /> : <ChevronDown className="h-4 w-4 text-amber-600" />}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="priceMin" className="text-xs font-medium text-gray-600">Min</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    placeholder="฿200K"
                    value={localFilters.priceMin || ""}
                    onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="priceMax" className="text-xs font-medium text-gray-600">Max</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    placeholder="฿800K"
                    value={localFilters.priceMax || ""}
                    onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Area Size Section */}
          <Collapsible open={isAreaOpen} onOpenChange={setIsAreaOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:bg-purple-100/50 transition-colors">
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-purple-800">Area (SQM)</span>
              </div>
              {isAreaOpen ? <ChevronUp className="h-4 w-4 text-purple-600" /> : <ChevronDown className="h-4 w-4 text-purple-600" />}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="areaMin" className="text-xs font-medium text-gray-600">Min</Label>
                  <Input
                    id="areaMin"
                    type="number"
                    placeholder="100"
                    value={localFilters.areaMin || ""}
                    onChange={(e) => updateFilter('areaMin', e.target.value ? Number(e.target.value) : undefined)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="areaMax" className="text-xs font-medium text-gray-600">Max</Label>
                  <Input
                    id="areaMax"
                    type="number"
                    placeholder="5000"
                    value={localFilters.areaMax || ""}
                    onChange={(e) => updateFilter('areaMax', e.target.value ? Number(e.target.value) : undefined)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* BTS Stations Section */}
          <Collapsible open={isBtsOpen} onOpenChange={setIsBtsOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-100 hover:bg-green-100/50 transition-colors">
              <div className="flex items-center gap-2">
                <Train className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-800">Near BTS Stations</span>
              </div>
              {isBtsOpen ? <ChevronUp className="h-4 w-4 text-green-600" /> : <ChevronDown className="h-4 w-4 text-green-600" />}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-3">
              {btsStations.map((station) => (
                <div key={station.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={station.name}
                      checked={localFilters.nearBts?.includes(station.name) || false}
                      onCheckedChange={() => toggleBtsStation(station.name)}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <Label
                      htmlFor={station.name}
                      className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                    >
                      <Train className="h-3 w-3 text-green-600" />
                      {station.name}
                    </Label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {station.count}
                  </Badge>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Clear Filters Button */}
          {getActiveFilterCount() > 0 && (
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* AI Response Panel */}
      {aiResponse && onCloseAIResponse && (
        <div className="mx-4 mb-4">
          <Card className="shadow-lg border border-blue-200/50 bg-blue-50/80 backdrop-blur-sm rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-blue-500">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-semibold text-blue-800 text-sm">AI Search Results</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCloseAIResponse}
                  className="h-6 w-6 p-0 hover:bg-blue-100"
                >
                  ×
                </Button>
              </div>
              <div className="text-xs text-blue-700 mb-2">
                "{aiResponse.query}"
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                {aiResponse.relevantPropertyIds.length} properties found
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}