import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface AnalyticsDashboardProps {
  onClose: () => void;
}

interface AnalyticsData {
  totalProperties: number;
  typeDistribution: Record<string, number>;
  priceDistribution: Record<string, number>;
  averagePrices: {
    office: number;
    residential: number;
    restaurant: number;
  };
  marketTrends: {
    office: { growth: number };
    residential: { growth: number };
    restaurant: { growth: number };
  };
}

export default function AnalyticsDashboard({ onClose }: AnalyticsDashboardProps) {
  const priceChartRef = useRef<HTMLCanvasElement>(null);
  const typeChartRef = useRef<HTMLCanvasElement>(null);
  const priceChartInstance = useRef<Chart | null>(null);
  const typeChartInstance = useRef<Chart | null>(null);

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  useEffect(() => {
    if (!analytics || !priceChartRef.current || !typeChartRef.current) return;

    // Cleanup existing charts
    if (priceChartInstance.current) {
      priceChartInstance.current.destroy();
    }
    if (typeChartInstance.current) {
      typeChartInstance.current.destroy();
    }

    // Price distribution chart
    const priceCtx = priceChartRef.current.getContext('2d');
    if (priceCtx) {
      priceChartInstance.current = new Chart(priceCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(analytics.priceDistribution),
          datasets: [{
            data: Object.values(analytics.priceDistribution),
            backgroundColor: [
              'hsl(231, 48%, 48%)', // office
              'hsl(291, 64%, 42%)', // residential
              'hsl(340, 82%, 52%)', // restaurant
              'hsl(36, 100%, 50%)'  // accent
            ],
            borderRadius: 4,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `Properties: ${context.parsed.y}`
              }
            }
          },
          scales: {
            y: { 
              beginAtZero: true, 
              display: false,
              grid: { display: false }
            },
            x: { 
              display: true,
              grid: { display: false },
              ticks: {
                font: { size: 10 }
              }
            }
          }
        }
      });
    }

    // Property types chart
    const typeCtx = typeChartRef.current.getContext('2d');
    if (typeCtx) {
      typeChartInstance.current = new Chart(typeCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(analytics.typeDistribution).map(key => 
            key.charAt(0).toUpperCase() + key.slice(1)
          ),
          datasets: [{
            data: Object.values(analytics.typeDistribution),
            backgroundColor: [
              'hsl(231, 48%, 48%)', // office
              'hsl(291, 64%, 42%)', // residential
              'hsl(340, 82%, 52%)'  // restaurant
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { 
              display: false 
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = Object.values(analytics.typeDistribution).reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }

    return () => {
      if (priceChartInstance.current) {
        priceChartInstance.current.destroy();
      }
      if (typeChartInstance.current) {
        typeChartInstance.current.destroy();
      }
    };
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="absolute bottom-4 left-4 right-4 z-[999] bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 text-center">
          <div className="loading-pulse">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-[999] bg-white rounded-xl shadow-lg border border-gray-200 slide-up">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Market Analytics</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Market Overview */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Market Overview</span>
            </h3>
            <div className="space-y-3">
              <Card className="bg-gray-50 border-none">
                <CardContent className="p-3">
                  <div className="text-xs text-gray-600">Avg. Office Price/SQM</div>
                  <div className="text-lg font-semibold text-office">
                    ₿{analytics.averagePrices.office.toLocaleString()}
                  </div>
                  <div className="text-xs text-secondary flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>+{analytics.marketTrends.office.growth}% vs last year</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-none">
                <CardContent className="p-3">
                  <div className="text-xs text-gray-600">Avg. Residential Price/SQM</div>
                  <div className="text-lg font-semibold text-residential">
                    ₿{analytics.averagePrices.residential.toLocaleString()}
                  </div>
                  <div className="text-xs text-secondary flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>+{analytics.marketTrends.residential.growth}% vs last year</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-none">
                <CardContent className="p-3">
                  <div className="text-xs text-gray-600">Avg. Restaurant Price/SQM</div>
                  <div className="text-lg font-semibold text-restaurant">
                    ₿{analytics.averagePrices.restaurant.toLocaleString()}
                  </div>
                  <div className="text-xs text-accent flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>+{analytics.marketTrends.restaurant.growth}% vs last year</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Price Distribution Chart */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Price Distribution</h3>
            <div className="h-40">
              <canvas ref={priceChartRef} />
            </div>
          </div>

          {/* Property Types Chart */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Property Types</h3>
            <div className="h-40">
              <canvas ref={typeChartRef} />
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-office"></div>
                  <span>Office</span>
                </span>
                <span>{analytics.typeDistribution.office || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-residential"></div>
                  <span>Residential</span>
                </span>
                <span>{analytics.typeDistribution.residential || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-restaurant"></div>
                  <span>Restaurant</span>
                </span>
                <span>{analytics.typeDistribution.restaurant || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
