import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Property, PropertyFilter } from "@shared/schema";
import { ChevronDown, ChevronUp, Filter, Building, Home, UtensilsCrossed, X } from "lucide-react";

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

  // Bangkok districts
  const districts = [
    { name: "Sathorn", count: properties.filter(p => p.address?.includes("Sathorn")).length },
    { name: "Silom", count: properties.filter(p => p.address?.includes("Silom") || p.address?.includes("Bang Rak")).length }
  ];

  const propertyTypes = [
    { id: "office", label: "Offices", icon: Building, count: properties.filter(p => p.type === "office").length },
    { id: "residential", label: "Residential", icon: Home, count: properties.filter(p => p.type === "residential").length },
    { id: "restaurant", label: "Restaurants", icon: UtensilsCrossed, count: properties.filter(p => p.type === "restaurant").length }
  ];

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.types?.length) count++;
    if (localFilters.priceMin || localFilters.priceMax) count++;
    if (localFilters.areaMin || localFilters.areaMax) count++;
    return count;
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Simple Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <h3 className="font-medium text-gray-900">Property Filters</h3>
          </div>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Property Type */}
        <Collapsible open={isTypeOpen} onOpenChange={setIsTypeOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
            <span className="font-medium text-gray-700 text-sm">Property Type</span>
            {isTypeOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2 space-y-2 pl-2">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = localFilters.types?.includes(type.id as any) || false;
              
              return (
                <div key={type.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={type.id}
                      checked={isSelected}
                      onCheckedChange={() => togglePropertyType(type.id as any)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={type.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Icon className="h-3 w-3 text-gray-500" />
                      {type.label}
                    </Label>
                  </div>
                  <span className="text-xs text-gray-400">({type.count})</span>
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Districts */}
        <Collapsible open={isDistrictOpen} onOpenChange={setIsDistrictOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
            <span className="font-medium text-gray-700 text-sm">Bangkok Districts</span>
            {isDistrictOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2 space-y-2 pl-2">
            {districts.map((district) => (
              <div key={district.name} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600">{district.name}</span>
                <span className="text-xs text-gray-400">({district.count})</span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Price Range */}
        <Collapsible open={isPriceOpen} onOpenChange={setIsPriceOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
            <span className="font-medium text-gray-700 text-sm">Price per SQM (THB)</span>
            {isPriceOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2 space-y-3 pl-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="priceMin" className="text-xs text-gray-500">Min</Label>
                <Input
                  id="priceMin"
                  type="number"
                  placeholder="200,000"
                  value={localFilters.priceMin || ""}
                  onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="priceMax" className="text-xs text-gray-500">Max</Label>
                <Input
                  id="priceMax"
                  type="number"
                  placeholder="800,000"
                  value={localFilters.priceMax || ""}
                  onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Area Size */}
        <Collapsible open={isAreaOpen} onOpenChange={setIsAreaOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
            <span className="font-medium text-gray-700 text-sm">Area (SQM)</span>
            {isAreaOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2 space-y-3 pl-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="areaMin" className="text-xs text-gray-500">Min</Label>
                <Input
                  id="areaMin"
                  type="number"
                  placeholder="100"
                  value={localFilters.areaMin || ""}
                  onChange={(e) => updateFilter('areaMin', e.target.value ? Number(e.target.value) : undefined)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="areaMax" className="text-xs text-gray-500">Max</Label>
                <Input
                  id="areaMax"
                  type="number"
                  placeholder="5000"
                  value={localFilters.areaMax || ""}
                  onChange={(e) => updateFilter('areaMax', e.target.value ? Number(e.target.value) : undefined)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Clear Filters */}
        {getActiveFilterCount() > 0 && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            size="sm"
            className="w-full text-sm"
          >
            Clear All Filters
          </Button>
        )}
      </div>

      {/* AI Response Panel */}
      {aiResponse && onCloseAIResponse && (
        <div className="mx-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-800 text-sm">AI Search Results</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCloseAIResponse}
                className="h-6 w-6 p-0 hover:bg-blue-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-blue-700 mb-2">
              "{aiResponse.query}"
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
              {aiResponse.relevantPropertyIds.length} properties found
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}