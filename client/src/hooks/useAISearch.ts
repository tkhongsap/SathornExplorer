import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AISearchRequest } from "@shared/schema";

interface AISearchResponse {
  response: string;
  relevantPropertyIds: number[];
  summary?: {
    count: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
  };
}

export function useAISearch() {
  return useMutation<AISearchResponse, Error, AISearchRequest>({
    mutationFn: async (data: AISearchRequest) => {
      const response = await apiRequest("POST", "/api/search", data);
      return await response.json();
    },
  });
}
