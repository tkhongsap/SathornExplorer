import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Building2, Home, Utensils, Calendar, Layers, Navigation } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

export default function PropertyModal({ property, onClose }: PropertyModalProps) {
  const getPropertyIcon = (type: string) => {
    switch (type) {
      case "office":
        return <Building2 className="h-5 w-5" />;
      case "residential":
        return <Home className="h-5 w-5" />;
      case "restaurant":
        return <Utensils className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case "office":
        return "bg-office text-white";
      case "residential":
        return "bg-residential text-white";
      case "restaurant":
        return "bg-restaurant text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const totalValue = property.area * property.pricePerSqm;

  // Get property image based on type
  const getPropertyImage = (type: string) => {
    switch (type) {
      case "office":
        return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
      case "residential":
        return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
      case "restaurant":
        return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
      default:
        return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center space-x-3">
              {getPropertyIcon(property.type)}
              <span>{property.name}</span>
            </DialogTitle>
            <Badge className={`${getPropertyTypeColor(property.type)} capitalize`}>
              {property.type}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[70vh] space-y-6">
          {/* Property Image */}
          <img 
            src={getPropertyImage(property.type)}
            alt={`${property.name} - ${property.type}`}
            className="w-full h-48 object-cover rounded-lg"
          />
          
          {/* Property Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Property Details</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Area:</span>
                  <span className="font-medium">{property.area.toLocaleString()} sqm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price/SQM:</span>
                  <span className="font-medium text-secondary">
                    ₿{property.pricePerSqm.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-medium text-primary">
                    ₿{totalValue.toLocaleString()}
                  </span>
                </div>
                {property.floors && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Layers className="h-3 w-3" />
                      <span>Floors:</span>
                    </span>
                    <span className="font-medium">{property.floors}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Location Info</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">District:</span>
                  <span className="font-medium">Sathorn</span>
                </div>
                {property.nearestBts && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Navigation className="h-3 w-3" />
                      <span>Nearest BTS:</span>
                    </span>
                    <span className="font-medium">
                      {property.nearestBts}
                      {property.btsDistance && ` (${property.btsDistance}m)`}
                    </span>
                  </div>
                )}
                {property.yearBuilt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Year Built:</span>
                    </span>
                    <span className="font-medium">{property.yearBuilt}</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 pt-1">
                  {property.address}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Property Description */}
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button className="flex-1 bg-primary text-white hover:bg-blue-700 transition-colors">
              View Full Details
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Add to Compare
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
