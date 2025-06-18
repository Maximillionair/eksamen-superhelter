// services/superheroService.js - Service to interact with the Superhero API
const axios = require('axios');
const Superhero = require('../models/Superhero');

const API_BASE_URL = 'https://superheroapi.com/api';
// Using API key from .env file
const API_KEY = process.env.SUPERHERO_API_KEY || '827b70542b140115fb17e369951a8fef';

/**
 * Fetch a hero by ID from the API and store in database
 */
exports.fetchAndStoreSingleHero = async (heroId) => {
  try {
    // Check if we already have this hero in our database
    const existingHero = await Superhero.findOne({ id: heroId });
    
    // If hero exists and was fetched less than 24 hours ago, return it
    if (existingHero && 
        (new Date() - existingHero.fetchedAt) < (24 * 60 * 60 * 1000)) {
      return existingHero;
    }
    
    // Fetch from API
    const response = await axios.get(`${API_BASE_URL}/${API_KEY}/${heroId}`);
    
    if (response.data.response === 'error') {
      throw new Error(response.data.error || 'Failed to fetch hero');
    }
    
    // Transform API data to match our schema
    const heroData = transformApiData(response.data);
    
    // Update or create in database
    if (existingHero) {
      Object.assign(existingHero, heroData, { fetchedAt: new Date() });
      await existingHero.save();
      return existingHero;
    } else {
      const newHero = new Superhero(heroData);
      await newHero.save();
      return newHero;
    }
  } catch (error) {
    console.error(`Error fetching hero ${heroId}:`, error);
    throw error;
  }
};

/**
 * Fetch a batch of heroes by ID range
 */
exports.fetchHeroBatch = async (startId, count) => {
  const heroes = [];
  const errors = [];
  
  // Process heroes in parallel with a limit
  const promises = [];
  for (let i = startId; i < startId + count; i++) {
    promises.push(
      this.fetchAndStoreSingleHero(i)
        .then(hero => heroes.push(hero))
        .catch(err => errors.push({ id: i, error: err.message }))
    );
  }
  
  await Promise.all(promises);
  
  return {
    heroes,
    errors,
    totalFetched: heroes.length
  };
};

/**
 * Search for heroes in the database
 */
exports.searchHeroes = async (query, limit = 20) => {
  try {
    if (!query || query.trim() === '') {
      return await Superhero.find().limit(limit);
    }
    
    // First try text search if it's configured
    try {
      const textSearchResults = await Superhero.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } }).limit(limit);
      
      if (textSearchResults.length > 0) {
        return textSearchResults;
      }
    } catch (textSearchError) {
      console.log('Text search not configured or failed, falling back to regex search');
    }
    
    // If text search returns no results or fails, fall back to regex search
    const regexPattern = new RegExp(query, 'i');
    const dbResults = await Superhero.find({
      $or: [
        { name: regexPattern },
        { 'biography.fullName': regexPattern },
        { 'biography.publisher': regexPattern }
      ]
    }).limit(limit);
    
    // If we have results from database, return them
    if (dbResults.length > 0) {
      return dbResults;
    }
    
    // If no results in database, search the API
    console.log(`No heroes found in database for "${query}", searching API...`);
    const apiResults = await this.searchSuperheroAPI(query);
    
    // If API returned results, save them to database and return
    if (apiResults && apiResults.length > 0) {
      console.log(`Found ${apiResults.length} heroes in API, saving to database...`);
      const savedHeroes = [];
      
      // Process each hero (limit to prevent too many operations)
      const heroesToProcess = apiResults.slice(0, Math.min(apiResults.length, limit));
      
      for (const apiHero of heroesToProcess) {
        try {
          // Transform API data to match our schema
          const heroData = {
            id: parseInt(apiHero.id),
            name: apiHero.name,
            powerstats: {
              intelligence: apiHero.powerstats.intelligence,
              strength: apiHero.powerstats.strength,
              speed: apiHero.powerstats.speed,
              durability: apiHero.powerstats.durability,
              power: apiHero.powerstats.power,
              combat: apiHero.powerstats.combat
            },
            biography: {
              fullName: apiHero.biography['full-name'],
              alterEgos: apiHero.biography['alter-egos'],
              aliases: apiHero.biography.aliases,
              placeOfBirth: apiHero.biography['place-of-birth'],
              firstAppearance: apiHero.biography['first-appearance'],
              publisher: apiHero.biography.publisher,
              alignment: apiHero.biography.alignment
            },
            appearance: {
              gender: apiHero.appearance.gender,
              race: apiHero.appearance.race,
              height: apiHero.appearance.height,
              weight: apiHero.appearance.weight,
              eyeColor: apiHero.appearance['eye-color'],
              hairColor: apiHero.appearance['hair-color']
            },
            work: {
              occupation: apiHero.work.occupation,
              base: apiHero.work.base
            },
            connections: {
              groupAffiliation: apiHero.connections['group-affiliation'],
              relatives: apiHero.connections.relatives
            },
            image: {
              url: apiHero.image.url
            },
            fetchedAt: new Date()
          };
          
          // Save hero to database
          const existingHero = await Superhero.findOne({ id: heroData.id });
          let savedHero;
          
          if (existingHero) {
            Object.assign(existingHero, heroData);
            savedHero = await existingHero.save();
          } else {
            const newHero = new Superhero(heroData);
            savedHero = await newHero.save();
          }
          
          savedHeroes.push(savedHero);
        } catch (error) {
          console.error(`Error saving hero ${apiHero.name}:`, error);
        }
      }
      
      return savedHeroes;
    }
    
    // If all searches fail, return empty array
    return [];
  } catch (error) {
    console.error('Error searching heroes:', error);
    throw error;
  }
};

/**
 * Get paginated heroes from database
 */
exports.getPaginatedHeroes = async (page = 1, limit = 20) => {
  try {
    const { executeQueryWithTimeout } = require('../utils/database');
    const skip = (page - 1) * limit;
    
    // Execute with timeout to prevent hanging requests
    const heroes = await executeQueryWithTimeout(
      Superhero.find().skip(skip).limit(limit),
      8000,  // 8 second timeout
      'Paginated heroes query'
    );
      
    const total = await executeQueryWithTimeout(
      Superhero.countDocuments(),
      5000,  // 5 second timeout
      'Heroes count query'
    );
    
    return {
      heroes: heroes || [],  // Ensure we return an array even if query fails
      currentPage: page,
      totalPages: Math.ceil(total / limit) || 1,  // Default to 1 page if count fails
      totalHeroes: total || 0  // Default to 0 if count fails
    };
  } catch (error) {
    console.error('Error getting paginated heroes:', error);
    // Return default values on error to prevent app from crashing
    return {
      heroes: [],
      currentPage: page,
      totalPages: 1,
      totalHeroes: 0
    };
  }
};

/**
 * Search the Superhero API by name
 */
exports.searchSuperheroAPI = async (name) => {
  try {
    console.log(`Searching Superhero API for: ${name}`);
    const response = await axios.get(`${API_BASE_URL}/${API_KEY}/search/${name}`);
    
    if (response.data.response === 'error') {
      console.log(`API Error: ${response.data.error}`);
      return [];
    }
    
    return response.data.results || [];
  } catch (error) {
    console.error('Error searching Superhero API:', error);
    throw error;
  }
};

/**
 * Find adjacent hero (previous or next) relative to a given hero ID
 * @param {Number} heroId - ID of the reference hero
 * @param {String} direction - 'prev' or 'next'
 * @returns {Object} - The found hero document or null
 */
exports.findAdjacentHero = async (heroId, direction) => {
  try {
    const query = direction === 'prev' 
      ? { id: { $lt: heroId } } // Previous hero has a lower ID
      : { id: { $gt: heroId } }; // Next hero has a higher ID
    
    const sort = direction === 'prev' 
      ? { id: -1 } // For previous, get the highest ID below current
      : { id: 1 };  // For next, get the lowest ID above current
    
    const hero = await Superhero.findOne(query).sort(sort);
    return hero;
  } catch (error) {
    console.error(`Error finding ${direction} hero for ${heroId}:`, error);
    return null;
  }
};

/**
 * Transform API data to match our schema
 */
function transformApiData(apiData) {
  return {
    id: parseInt(apiData.id),
    name: apiData.name,
    powerstats: {
      intelligence: apiData.powerstats.intelligence,
      strength: apiData.powerstats.strength,
      speed: apiData.powerstats.speed,
      durability: apiData.powerstats.durability,
      power: apiData.powerstats.power,
      combat: apiData.powerstats.combat
    },
    biography: {
      fullName: apiData.biography['full-name'],
      alterEgos: apiData.biography['alter-egos'],
      aliases: apiData.biography.aliases,
      placeOfBirth: apiData.biography['place-of-birth'],
      firstAppearance: apiData.biography['first-appearance'],
      publisher: apiData.biography.publisher,
      alignment: apiData.biography.alignment
    },
    appearance: {
      gender: apiData.appearance.gender,
      race: apiData.appearance.race,
      height: apiData.appearance.height,
      weight: apiData.appearance.weight,
      eyeColor: apiData.appearance['eye-color'],
      hairColor: apiData.appearance['hair-color']
    },
    work: {
      occupation: apiData.work.occupation,
      base: apiData.work.base
    },
    connections: {
      groupAffiliation: apiData.connections['group-affiliation'],
      relatives: apiData.connections.relatives
    },
    image: {
      url: apiData.image.url
    },
    fetchedAt: new Date()
  };
}

/**
 * Get top favorited heroes
 * @param {Number} limit - Maximum number of heroes to return
 * @returns {Array} - Array of top favorited heroes
 */
exports.getTopHeroes = async (limit = 10) => {
  try {
    const { executeQueryWithTimeout } = require('../utils/database');
    
    const topHeroes = await executeQueryWithTimeout(
      Superhero.find({ favoritesCount: { $gt: 0 } })
        .sort({ favoritesCount: -1 })
        .limit(limit),
      8000,  // 8 second timeout
      'Top heroes query'
    );
      
    return topHeroes || [];  // Ensure we return an array even if query fails
  } catch (error) {
    console.error('Error getting top heroes:', error);
    return [];  // Return empty array on error to prevent app from crashing
  }
};
