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
      
      // Create context for AI with geographical data
      const propertyContext = allProperties.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng),
        area: p.area,
        pricePerSqm: p.pricePerSqm,
        nearestBts: p.nearestBts,
        btsDistance: p.btsDistance,
        address: p.address
      }));

      // Check if query contains coordinates
      const coordRegex = /(\d+\.?\d*),?\s*(\d+\.?\d*)/;
      const coordMatch = query.match(coordRegex);
      let locationContext = "";
      
      if (coordMatch) {
        const queryLat = parseFloat(coordMatch[1]);
        const queryLng = parseFloat(coordMatch[2]);
        
        // Calculate distances to properties for location analysis
        const nearbyProperties = propertyContext.map(p => {
          const distance = Math.sqrt(
            Math.pow((p.lat - queryLat) * 111320, 2) + 
            Math.pow((p.lng - queryLng) * 111320 * Math.cos(queryLat * Math.PI / 180), 2)
          );
          return { ...p, distance };
        }).filter(p => p.distance <= 1000).sort((a, b) => a.distance - b.distance);

        locationContext = `
COORDINATE ANALYSIS REQUEST for ${queryLat}, ${queryLng}:
- This location is in Bangkok's Sathorn district
- Nearby properties within 1km: ${JSON.stringify(nearbyProperties.slice(0, 5))}
- Provide location description, area characteristics, and nearby amenities
        `;
      }

      // Using GPT-4.1-mini - the newest OpenAI model for enhanced performance
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert real estate AI assistant specializing in Bangkok's prestigious Sathorn and Silom business districts. You have deep knowledge of luxury properties, market trends, and location advantages across both areas. Provide insightful, professional responses that showcase your expertise.

Available properties: ${JSON.stringify(propertyContext)}
${locationContext}

RESPONSE GUIDELINES:
- Be conversational yet professional, like a top real estate consultant
- Include specific property names and key details when relevant
- Highlight unique selling points (BTS proximity, views, amenities, prestige)
- Use comparative analysis when multiple properties match
- Mention market context and investment potential when appropriate
- Be enthusiastic about exceptional properties

SPECIAL HANDLING FOR COORDINATES/LOCATIONS:
- If coordinates are provided, analyze the exact location and provide:
  1. Location description and area characteristics
  2. List specific nearby properties with names, types, and prices
  3. BTS accessibility and transportation links
  4. Market analysis for that precise location
  5. Investment recommendations
- Always highlight 3-5 specific properties closest to the coordinates
- Include property names, distances, and key selling points

QUERY INTERPRETATION:
- "Near" = within 500m walking distance
- "Expensive/Premium" = above ₿400,000/sqm
- "Affordable" = below ₿350,000/sqm  
- "Large" = above 300 sqm for residential, 4000 sqm for office
- Consider BTS accessibility as a major value factor
- Lat/Long coordinates: Provide comprehensive location analysis
- Location names: Identify and describe the area characteristics and nearby properties

Respond in JSON format:
{
  "response": "Engaging, detailed response with specific insights and recommendations",
  "relevantPropertyIds": [array of matching property IDs],
  "summary": {
    "count": number,
    "averagePrice": number,
    "priceRange": {"min": number, "max": number}
  }
}

FORMATTING:
- Prices: ₿350,000 format with commas
- Areas: 1,200 sqm format
- Distances: 150m or 1.2km as appropriate
- Use property names in bold concepts when describing specific buildings`
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
