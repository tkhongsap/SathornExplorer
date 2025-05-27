import { useQuery } from "@tanstack/react-query";
import type { Property } from "@shared/schema";

export function useProperties() {
  return useQuery<Property[]>({
    queryKey: ["/api/properties"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProperty(id: number) {
  return useQuery<Property>({
    queryKey: ["/api/properties", id],
    enabled: !!id,
  });
}
