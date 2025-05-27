import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Property, PropertyFilter } from "@shared/schema";

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

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

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

  // Calculate property counts by type
  const typeCounts = properties.reduce((acc, property) => {
    acc[property.type] = (acc[property.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get unique BTS stations
  const btsStations = Array.from(
    new Set(properties.map(p => p.nearestBts).filter(Boolean))
  ).sort();

  return (
    <Card className="h-full flex flex-col shadow-lg border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Property Filters
        </CardTitle>
        <p className="text-sm text-gray-600">Refine your search results</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto sidebar-scroll space-y-6">
        {/* Property Type Filter */}
        <div>
          <h3 className="font-medium text-gray-800 mb-3">Property Type</h3>
          <div className="space-y-3">
            {[
              { type: "office", label: "Offices", color: "bg-office" },
              { type: "residential", label: "Residential", color: "bg-residential" },
              { type: "restaurant", label: "Restaurants", color: "bg-restaurant" }
            ].map(({ type, label, color }) => (
              <div key={type} className="flex items-center space-x-3">
                <Checkbox
                  id={type}
                  checked={localFilters.types?.includes(type as any) || false}
                  onCheckedChange={() => togglePropertyType(type as any)}
                  className="focus-ring"
                />
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <Label
                  htmlFor={type}
                  className="text-sm text-gray-700 cursor-pointer flex-1"
                >
                  {label}{" "}
                  <span className="text-gray-500">
                    ({typeCounts[type] || 0})
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range Filter */}
        <div>
          <h3 className="font-medium text-gray-800 mb-3">Price per SQM (THB)</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.priceMin || ""}
                onChange={(e) => updateFilter('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                className="text-sm focus-ring"
              />
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.priceMax || ""}
                onChange={(e) => updateFilter('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                className="text-sm focus-ring"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>₿200K</span>
              <span>₿800K</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Area Filter */}
        <div>
          <h3 className="font-medium text-gray-800 mb-3">Area (SQM)</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.areaMin || ""}
                onChange={(e) => updateFilter('areaMin', e.target.value ? parseInt(e.target.value) : undefined)}
                className="text-sm focus-ring"
              />
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.areaMax || ""}
                onChange={(e) => updateFilter('areaMax', e.target.value ? parseInt(e.target.value) : undefined)}
                className="text-sm focus-ring"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* BTS Stations Filter */}
        <div>
          <h3 className="font-medium text-gray-800 mb-3">Near BTS Stations</h3>
          <div className="space-y-2">
            {btsStations.map(station => (
              <div key={station} className="flex items-center space-x-3">
                <Checkbox
                  id={`bts-${station}`}
                  checked={localFilters.nearBts?.includes(station) || false}
                  onCheckedChange={() => toggleBtsStation(station)}
                  className="focus-ring"
                />
                <Label
                  htmlFor={`bts-${station}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {station}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Clear Filters Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors focus-ring"
        >
          Clear All Filters
        </Button>
      </div>
    </Card>
  );
}
