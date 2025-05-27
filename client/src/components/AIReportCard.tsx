import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bot, Move, Maximize2, Minimize2 } from "lucide-react";

interface AIReportCardProps {
  query: string;
  response: string;
  relevantPropertyIds: number[];
  onClose: () => void;
}

export default function AIReportCard({ query, response, relevantPropertyIds, onClose }: AIReportCardProps) {
  const [position, setPosition] = useState({ x: 50, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <Card 
      ref={cardRef}
      className="absolute z-[1000] w-96 shadow-2xl border border-gray-200 bg-white/95 backdrop-blur-sm"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Header with drag handle */}
      <CardHeader 
        className="pb-3 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <Bot className="text-white h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">AI Property Analysis</h3>
              <Badge variant="secondary" className="text-xs mt-1">
                {relevantPropertyIds.length} properties found
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Move indicator */}
        <div className="flex items-center justify-center mt-2">
          <Move className="h-3 w-3 text-gray-300" />
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="max-h-80 overflow-y-auto space-y-4">
          {/* User Query */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 mb-1">YOUR QUERY</div>
            <p className="text-sm text-gray-800 font-medium">
              "{query}"
            </p>
          </div>
          
          {/* AI Response */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
            <div className="text-xs font-medium text-gray-500 mb-2">AI ANALYSIS</div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {response}
            </div>
          </div>

          {/* Property Highlights for Coordinate Searches */}
          {relevantPropertyIds.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">NEARBY PROPERTIES</div>
              <div className="text-xs text-blue-600 font-medium">
                {relevantPropertyIds.length} properties highlighted on map
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Properties shown with enhanced markers for easy identification
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-primary">{relevantPropertyIds.length}</div>
              <div className="text-xs text-gray-600">Properties Found</div>
            </div>
            <div className="bg-secondary/10 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-secondary">★★★★★</div>
              <div className="text-xs text-gray-600">AI Confidence</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => {
                // Could trigger analytics view
              }}
            >
              View Analytics
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => {
                // Could export results
              }}
            >
              Export Results
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}