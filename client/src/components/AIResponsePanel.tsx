import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bot, Search, BarChart3 } from "lucide-react";

interface AIResponsePanelProps {
  query: string;
  response: string;
  onClose: () => void;
}

export default function AIResponsePanel({ query, response, onClose }: AIResponsePanelProps) {
  return (
    <Card className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[998] w-full max-w-2xl mx-4 shadow-lg border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <Bot className="text-white h-4 w-4" />
            </div>
            <h3 className="font-medium text-gray-800">AI Analysis</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="max-h-64 overflow-y-auto space-y-4">
        {/* User Query */}
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
            <Search className="text-white h-3 w-3" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 font-medium">
              "{query}"
            </p>
          </div>
        </div>
        
        {/* AI Response */}
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
            <BarChart3 className="text-white h-3 w-3" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 leading-relaxed">
              {response}
            </p>
          </div>
        </div>

        {/* Response badges could be added here based on additional data */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="secondary" className="text-xs">
            AI-Powered Analysis
          </Badge>
          <Badge variant="outline" className="text-xs">
            Real-time Data
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
