import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bot, Move, Maximize2, Minimize2, Star, MapPin, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AIReportCardProps {
  query: string;
  response: string;
  relevantPropertyIds: number[];
  onClose: () => void;
}

export default function AIReportCard({ query, response, relevantPropertyIds, onClose }: AIReportCardProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [size, setSize] = useState({ width: 380, height: 500 });
  const [isResizing, setIsResizing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      } else if (isResizing) {
        setSize({
          width: Math.max(320, e.clientX - position.x + 10),
          height: Math.max(400, e.clientY - position.y + 10)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDragging ? 'grabbing' : 'nw-resize';
    } else {
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, isResizing, dragOffset, position]);

  return (
    <div 
      ref={cardRef}
      className="fixed z-[2000]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      <Card className="h-full shadow-2xl border border-gray-200/50 bg-white/98 backdrop-blur-md rounded-xl overflow-hidden">
        {/* Professional Header */}
        <CardHeader className="pb-0 bg-gradient-to-r from-slate-50 via-blue-50 to-emerald-50 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-white/60 transition-all duration-200 bg-white/40"
                onMouseDown={handleMouseDown}
              >
                <Move className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">AI Property Analysis</h3>
                  <p className="text-xs text-gray-500">Bangkok Real Estate Intelligence</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0 hover:bg-white/60"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Performance Badges */}
          <div className="flex gap-2 mb-3">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-medium">
              <Star className="h-3 w-3 mr-1" />
              {relevantPropertyIds.length} Properties
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-full overflow-hidden">
          <div className="p-4 h-full flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: `${size.height - 140}px` }}>
            {/* Query Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Your Query</span>
              </div>
              <p className="text-sm text-blue-900 font-medium leading-relaxed">
                "{query}"
              </p>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">AI Analysis</span>
              </div>
              <div 
                className={`text-sm text-gray-700 leading-relaxed ${
                  isExpanded ? 'max-h-none' : 'max-h-32 overflow-y-auto'
                }`}
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                }}
              >
                <ReactMarkdown 
                  className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-strong:text-gray-900 prose-p:text-gray-700"
                >
                  {response}
                </ReactMarkdown>
              </div>
            </div>

            {/* Properties Highlight */}
            {relevantPropertyIds.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Map Highlights</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-emerald-800">
                      {relevantPropertyIds.length} properties highlighted
                    </div>
                    <div className="text-xs text-emerald-600 mt-1">
                      Enhanced markers for easy identification
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(Math.min(5, relevantPropertyIds.length))].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-emerald-400" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <div className="text-2xl font-bold text-blue-600">{relevantPropertyIds.length}</div>
                <div className="text-xs text-gray-500 font-medium">Properties Found</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-xs text-gray-500 font-medium">AI Confidence</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-auto pt-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs font-medium">
                View Analytics
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs font-medium">
                Export Report
              </Button>
            </div>
          </div>

          {/* Resize Handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-50 hover:opacity-100 transition-opacity"
            onMouseDown={handleResizeMouseDown}
          >
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 rounded-tl-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}