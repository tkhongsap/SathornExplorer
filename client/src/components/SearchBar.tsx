import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mic, Loader2 } from "lucide-react";
import { useAISearch } from "@/hooks/useAISearch";
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  onAIResponse: (response: {
    query: string;
    response: string;
    relevantPropertyIds: number[];
  }) => void;
}

export default function SearchBar({ onAIResponse }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { mutate: searchAI, isPending } = useAISearch();
  const { toast } = useToast();

  // Listen for demo query events
  useEffect(() => {
    const handleDemoQuery = (event: CustomEvent) => {
      setQuery(event.detail);
      // Auto-trigger search after a brief delay for demo effect
      setTimeout(() => {
        searchAI(
          { query: event.detail },
          {
            onSuccess: (data) => {
              onAIResponse({
                query: event.detail,
                response: data.response,
                relevantPropertyIds: data.relevantPropertyIds || []
              });
              toast({
                title: "Search Complete",
                description: `Found ${data.relevantPropertyIds?.length || 0} relevant properties.`
              });
            },
            onError: (error) => {
              console.error("Search error:", error);
              toast({
                title: "Search Failed",
                description: "Unable to process your query. Please try again.",
                variant: "destructive"
              });
            }
          }
        );
      }, 500);
    };

    document.addEventListener('demoQuery', handleDemoQuery as EventListener);
    return () => {
      document.removeEventListener('demoQuery', handleDemoQuery as EventListener);
    };
  }, [searchAI, onAIResponse, toast]);

  const handleSearch = () => {
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a search query to get started.",
        variant: "destructive"
      });
      return;
    }

    searchAI(
      { query: query.trim() },
      {
        onSuccess: (data) => {
          onAIResponse({
            query: query.trim(),
            response: data.response,
            relevantPropertyIds: data.relevantPropertyIds || []
          });
          toast({
            title: "Search Complete",
            description: `Found ${data.relevantPropertyIds?.length || 0} relevant properties.`
          });
        },
        onError: (error) => {
          console.error("Search error:", error);
          toast({
            title: "Search Failed",
            description: "Unable to process your query. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Input Unavailable",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Voice Input Error",
        description: "Could not capture voice input. Please try again.",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="bg-white rounded-full shadow-lg border border-gray-200 flex items-center p-2">
      <div className="flex-1 flex items-center">
        <Search className="text-gray-400 ml-4 mr-3 h-5 w-5" />
        <Input
          type="text"
          placeholder="Ask me anything about Sathorn properties..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 border-none outline-none focus:ring-0 text-sm text-gray-700 bg-transparent shadow-none"
          disabled={isPending}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVoiceInput}
          disabled={isPending}
          className={`p-2 text-gray-400 hover:text-primary transition-colors ${
            isListening ? 'text-red-500 animate-pulse' : ''
          }`}
        >
          <Mic className="h-5 w-5" />
        </Button>
      </div>
      <Button
        onClick={handleSearch}
        disabled={isPending || !query.trim()}
        className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors ml-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Searching...
          </>
        ) : (
          'Search'
        )}
      </Button>
    </div>
  );
}
