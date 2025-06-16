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
    
    // Search in database
    return await Superhero.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } }).limit(limit);
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
    const skip = (page - 1) * limit;
    
    const heroes = await Superhero.find()
      .skip(skip)
      .limit(limit);
      
    const total = await Superhero.countDocuments();
    
    return {
      heroes,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalHeroes: total
    };
  } catch (error) {
    console.error('Error getting paginated heroes:', error);
    throw error;
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
