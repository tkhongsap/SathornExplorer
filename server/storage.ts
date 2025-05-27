import { properties, aiQueries, type Property, type InsertProperty, type AIQuery, type InsertAIQuery } from "@shared/schema";

export interface IStorage {
  // Property methods
  getAllProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  getPropertiesByFilter(filter: {
    types?: string[];
    priceMin?: number;
    priceMax?: number;
    areaMin?: number;
    areaMax?: number;
    nearBts?: string[];
  }): Promise<Property[]>;
  
  // AI Query methods
  createAIQuery(query: InsertAIQuery): Promise<AIQuery>;
  getRecentAIQueries(limit: number): Promise<AIQuery[]>;
}

export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private aiQueries: Map<number, AIQuery>;
  private currentPropertyId: number;
  private currentQueryId: number;

  constructor() {
    this.properties = new Map();
    this.aiQueries = new Map();
    this.currentPropertyId = 1;
    this.currentQueryId = 1;
    
    // Initialize with Sathorn district properties
    this.initializeProperties();
  }

  private async initializeProperties() {
    const sathornProperties: InsertProperty[] = [
      // Premium Offices
      {
        name: "Empire Tower",
        type: "office",
        lat: "13.7240",
        lng: "100.5347",
        area: 5000,
        pricePerSqm: 350000,
        description: "Premium Grade A office tower in the heart of Sathorn business district. Features modern amenities, excellent connectivity to BTS system, and panoramic city views.",
        address: "1 Empire Tower, South Sathorn Road, Sathorn, Bangkok",
        nearestBts: "Chong Nonsi",
        btsDistance: 200,
        yearBuilt: 2014,
        floors: 47
      },
      {
        name: "Sathorn Square",
        type: "office",
        lat: "13.7219",
        lng: "100.5339",
        area: 3200,
        pricePerSqm: 320000,
        description: "Modern business complex with state-of-the-art facilities and excellent transport links.",
        address: "98 Sathorn Square, North Sathorn Road, Sathorn, Bangkok",
        nearestBts: "Sala Daeng",
        btsDistance: 300,
        yearBuilt: 2016,
        floors: 35
      },
      {
        name: "Ocean Tower",
        type: "office",
        lat: "13.7201",
        lng: "100.5356",
        area: 4100,
        pricePerSqm: 385000,
        description: "Luxury office space with premium finishes and world-class amenities.",
        address: "75 Ocean Tower, South Sathorn Road, Sathorn, Bangkok",
        nearestBts: "Surasak",
        btsDistance: 150,
        yearBuilt: 2018,
        floors: 42
      },
      {
        name: "M.R. Kukrit Pramoj Heritage Home",
        type: "office",
        lat: "13.7180",
        lng: "100.5301",
        area: 2800,
        pricePerSqm: 295000,
        description: "Heritage office building with traditional Thai architecture and modern facilities.",
        address: "19 Soi Phra Pinit, South Sathorn Road, Sathorn, Bangkok",
        nearestBts: "Chong Nonsi",
        btsDistance: 400,
        yearBuilt: 1995,
        floors: 25
      },
      {
        name: "Silom Complex",
        type: "office",
        lat: "13.7250",
        lng: "100.5370",
        area: 6500,
        pricePerSqm: 410000,
        description: "Large commercial complex with integrated retail and office spaces.",
        address: "191 Silom Road, Sathorn, Bangkok",
        nearestBts: "Sala Daeng",
        btsDistance: 100,
        yearBuilt: 2020,
        floors: 55
      },

      // Luxury Residential
      {
        name: "The Met Condo",
        type: "residential",
        lat: "13.7195",
        lng: "100.5342",
        area: 200,
        pricePerSqm: 300000,
        description: "Luxury condominium with river views and premium amenities including infinity pool and fitness center.",
        address: "123 The Met, South Sathorn Road, Sathorn, Bangkok",
        nearestBts: "Chong Nonsi",
        btsDistance: 250,
        yearBuilt: 2017,
        floors: 40
      },
      {
        name: "Sathorn Gardens",
        type: "residential",
        lat: "13.7208",
        lng: "100.5315",
        area: 180,
        pricePerSqm: 275000,
        description: "Garden view apartments with lush landscaping and family-friendly amenities.",
        address: "45 Sathorn Gardens, North Sathorn Road, Sathorn, Bangkok",
        nearestBts: "Sala Daeng",
        btsDistance: 350,
        yearBuilt: 2015,
        floors: 32
      },
      {
        name: "The River Condo",
        type: "residential",
        lat: "13.7175",
        lng: "100.5380",
        area: 350,
        pricePerSqm: 420000,
        description: "Riverside luxury living with private balconies overlooking the Chao Phraya River.",
        address: "88 River View Tower, Charoen Rat Road, Sathorn, Bangkok",
        nearestBts: "Saphan Taksin",
        btsDistance: 180,
        yearBuilt: 2019,
        floors: 50
      },
      {
        name: "Baan Sathorn",
        type: "residential",
        lat: "13.7230",
        lng: "100.5290",
        area: 150,
        pricePerSqm: 260000,
        description: "Compact urban living with modern design and convenient location.",
        address: "67 Baan Sathorn, Pan Road, Sathorn, Bangkok",
        nearestBts: "Chong Nonsi",
        btsDistance: 450,
        yearBuilt: 2014,
        floors: 28
      },
      {
        name: "Noble House",
        type: "residential",
        lat: "13.7265",
        lng: "100.5325",
        area: 280,
        pricePerSqm: 380000,
        description: "Premium residential tower with concierge services and rooftop facilities.",
        address: "156 Noble House, Silom Road, Sathorn, Bangkok",
        nearestBts: "Sala Daeng",
        btsDistance: 120,
        yearBuilt: 2021,
        floors: 45
      },

      // Fine Dining Restaurants
      {
        name: "The House on Sathorn",
        type: "restaurant",
        lat: "13.7225",
        lng: "100.5325",
        area: 320,
        pricePerSqm: 420000,
        description: "Fine dining establishment in a beautifully restored heritage building with contemporary cuisine.",
        address: "106 The House on Sathorn, North Sathorn Road, Sathorn, Bangkok",
        nearestBts: "Sala Daeng",
        btsDistance: 280,
        yearBuilt: 2008,
        floors: 2
      },
      {
        name: "Blue Elephant",
        type: "restaurant",
        lat: "13.7189",
        lng: "100.5361",
        area: 280,
        pricePerSqm: 395000,
        description: "Royal Thai cuisine in an elegant colonial mansion setting.",
        address: "233 Blue Elephant, South Sathorn Road, Sathorn, Bangkok",
        nearestBts: "Surasak",
        btsDistance: 200,
        yearBuilt: 1990,
        floors: 3
      },
      {
        name: "Eat Me Restaurant",
        type: "restaurant",
        lat: "13.7155",
        lng: "100.5341",
        area: 180,
        pricePerSqm: 450000,
        description: "Contemporary dining with innovative fusion cuisine and artistic presentation.",
        address: "1/6 Eat Me, Soi Pipat 2, Convent Road, Sathorn, Bangkok",
        nearestBts: "Sala Daeng",
        btsDistance: 400,
        yearBuilt: 2012,
        floors: 2
      },
      {
        name: "Le Du",
        type: "restaurant",
        lat: "13.7203",
        lng: "100.5333",
        area: 160,
        pricePerSqm: 475000,
        description: "Michelin starred restaurant featuring modern Thai cuisine with seasonal ingredients.",
        address: "399/3 Le Du, Silom 7, Silom Road, Sathorn, Bangkok",
        nearestBts: "Sala Daeng",
        btsDistance: 250,
        yearBuilt: 2014,
        floors: 1
      },
      {
        name: "Gaggan Anand",
        type: "restaurant",
        lat: "13.7241",
        lng: "100.5351",
        area: 220,
        pricePerSqm: 520000,
        description: "Progressive Indian cuisine by renowned chef Gaggan Anand with innovative molecular gastronomy.",
        address: "68/1 Gaggan, Soi Langsuan, Ploenchit Road, Sathorn, Bangkok",
        nearestBts: "Chit Lom",
        btsDistance: 300,
        yearBuilt: 2017,
        floors: 2
      }
    ];

    for (const property of sathornProperties) {
      await this.createProperty(property);
    }
  }

  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const property: Property = { ...insertProperty, id };
    this.properties.set(id, property);
    return property;
  }

  async getPropertiesByFilter(filter: {
    types?: string[];
    priceMin?: number;
    priceMax?: number;
    areaMin?: number;
    areaMax?: number;
    nearBts?: string[];
  }): Promise<Property[]> {
    let filteredProperties = Array.from(this.properties.values());

    if (filter.types && filter.types.length > 0) {
      filteredProperties = filteredProperties.filter(p => filter.types!.includes(p.type));
    }

    if (filter.priceMin !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.pricePerSqm >= filter.priceMin!);
    }

    if (filter.priceMax !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.pricePerSqm <= filter.priceMax!);
    }

    if (filter.areaMin !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.area >= filter.areaMin!);
    }

    if (filter.areaMax !== undefined) {
      filteredProperties = filteredProperties.filter(p => p.area <= filter.areaMax!);
    }

    if (filter.nearBts && filter.nearBts.length > 0) {
      filteredProperties = filteredProperties.filter(p => 
        p.nearestBts && filter.nearBts!.includes(p.nearestBts)
      );
    }

    return filteredProperties;
  }

  async createAIQuery(insertQuery: InsertAIQuery): Promise<AIQuery> {
    const id = this.currentQueryId++;
    const query: AIQuery = { ...insertQuery, id };
    this.aiQueries.set(id, query);
    return query;
  }

  async getRecentAIQueries(limit: number): Promise<AIQuery[]> {
    const queries = Array.from(this.aiQueries.values());
    return queries.slice(-limit).reverse();
  }
}

export const storage = new MemStorage();
