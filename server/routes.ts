import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { propertyFilterSchema, aiSearchSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all properties
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get property by ID
  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Filter properties
  app.post("/api/properties/filter", async (req, res) => {
    try {
      const filter = propertyFilterSchema.parse(req.body);
      const properties = await storage.getPropertiesByFilter(filter);
      res.json(properties);
    } catch (error) {
      res.status(400).json({ message: "Invalid filter parameters" });
    }
  });

  // AI-powered search
  app.post("/api/search", async (req, res) => {
    try {
      const { query } = aiSearchSchema.parse(req.body);
      
      // Get all properties for context
      const allProperties = await storage.getAllProperties();
      
      // Create context for AI
      const propertyContext = allProperties.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        area: p.area,
        pricePerSqm: p.pricePerSqm,
        nearestBts: p.nearestBts,
        btsDistance: p.btsDistance
      }));

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a real estate AI assistant for Bangkok's Sathorn district. Analyze user queries and provide helpful insights about properties. 

Available properties: ${JSON.stringify(propertyContext)}

When responding, provide:
1. A natural language answer to the user's question
2. Relevant property IDs that match the query
3. Summary statistics if applicable

Respond in JSON format with:
{
  "response": "Natural language response",
  "relevantPropertyIds": [array of property IDs],
  "summary": {
    "count": number,
    "averagePrice": number,
    "priceRange": {"min": number, "max": number}
  }
}

Price format: Use ₿ symbol followed by formatted number (e.g., ₿350,000)
Distance format: Include units (e.g., 200m, 2km)
`
          },
          {
            role: "user",
            content: query
          }
        ],
        response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
      
      // Store the query and response
      await storage.createAIQuery({
        query,
        response: aiResponse.response,
        propertyIds: JSON.stringify(aiResponse.relevantPropertyIds || [])
      });

      res.json(aiResponse);
    } catch (error) {
      console.error("AI search error:", error);
      res.status(500).json({ 
        message: "Failed to process search query",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get analytics data
  app.get("/api/analytics", async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      
      // Calculate analytics
      const typeStats = properties.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const priceRanges = {
        "200-300K": 0,
        "300-400K": 0,
        "400-500K": 0,
        "500K+": 0
      };

      properties.forEach(p => {
        const price = p.pricePerSqm;
        if (price < 300000) priceRanges["200-300K"]++;
        else if (price < 400000) priceRanges["300-400K"]++;
        else if (price < 500000) priceRanges["400-500K"]++;
        else priceRanges["500K+"]++;
      });

      const officeProperties = properties.filter(p => p.type === "office");
      const residentialProperties = properties.filter(p => p.type === "residential");
      const restaurantProperties = properties.filter(p => p.type === "restaurant");

      const avgPrices = {
        office: officeProperties.length > 0 
          ? Math.round(officeProperties.reduce((sum, p) => sum + p.pricePerSqm, 0) / officeProperties.length)
          : 0,
        residential: residentialProperties.length > 0
          ? Math.round(residentialProperties.reduce((sum, p) => sum + p.pricePerSqm, 0) / residentialProperties.length)
          : 0,
        restaurant: restaurantProperties.length > 0
          ? Math.round(restaurantProperties.reduce((sum, p) => sum + p.pricePerSqm, 0) / restaurantProperties.length)
          : 0
      };

      res.json({
        totalProperties: properties.length,
        typeDistribution: typeStats,
        priceDistribution: priceRanges,
        averagePrices: avgPrices,
        marketTrends: {
          office: { growth: 5.2 },
          residential: { growth: 3.8 },
          restaurant: { growth: 12.1 }
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
