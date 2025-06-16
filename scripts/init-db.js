// scripts/init-db.js - Script to initialize the database with superhero data
const path = require('path');
// Load environment variables from .env file
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  console.log('Using .env file in parent directory');
} catch (err) {
  console.log('Could not find .env file in parent directory, trying current directory');
  require('dotenv').config();
}
const mongoose = require('mongoose');
const axios = require('axios');
const Superhero = require('../models/Superhero');

// Connect to MongoDB with fixed URI
const mongoUri = 'mongodb://10.12.87.70:27017/superhero-app';
console.log(`Connecting to MongoDB at: ${mongoUri}`);

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define the superhero IDs to fetch
// We're using a predefined list of popular heroes to ensure we get good data
const heroIds = [
  1,    // A-Bomb
  2,    // Abe Sapien
  30,   // Ant-Man
  38,   // Aquaman
  60,   // Batman
  63,   // Batgirl
  70,   // Black Panther
  106,  // Captain America
  107,  // Captain Atom
  149,  // Captain Marvel
  165,  // Catwoman
  176,  // Chuck Norris
  195,  // Cyborg
  213,  // Deadpool
  263,  // Flash
  303,  // Groot
  322,  // Hulk
  332,  // Ironman
  369,  // Jessica Jones
  370,  // Joker
  396,  // Loki
  414,  // Magneto
  416,  // Luke Cage
  423,  // Mystique
  479,  // Poison Ivy
  498,  // Ra's Al Ghul
  514,  // Robin
  579,  // Silver Surfer
  620,  // Spider-Man
  622,  // Spock
  644,  // Superman
  655,  // Thanos
  659,  // Thor
  687,  // Venom
  697,  // Vision
  714,  // Wonder Woman
  717,  // Wolverine
  720,  // Yoda
];

// API configuration
const API_BASE_URL = 'https://superheroapi.com/api';
// Using API key from .env file
const API_KEY = process.env.SUPERHERO_API_KEY || '827b70542b140115fb17e369951a8fef';

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
 * Fetch a hero by ID from the API
 */
async function fetchHero(heroId) {
  try {
    console.log(`Fetching hero with ID: ${heroId}`);
    const response = await axios.get(`${API_BASE_URL}/${API_KEY}/${heroId}`);
    
    if (response.data.response === 'error') {
      throw new Error(response.data.error || 'Failed to fetch hero');
    }
    
    return transformApiData(response.data);
  } catch (error) {
    console.error(`Error fetching hero ${heroId}:`, error.message);
    throw error;
  }
}

/**
 * Save or update hero in database
 */
async function saveHero(heroData) {
  try {
    const existing = await Superhero.findOne({ id: heroData.id });
    
    if (existing) {
      console.log(`Updating existing hero: ${heroData.name}`);
      Object.assign(existing, heroData);
      return await existing.save();
    } else {
      console.log(`Creating new hero: ${heroData.name}`);
      const newHero = new Superhero(heroData);
      return await newHero.save();
    }
  } catch (error) {
    console.error(`Error saving hero ${heroData.name}:`, error);
    throw error;
  }
}

/**
 * Main function to fetch and save heroes
 */
async function initializeDatabase() {
  console.log('Starting database initialization...');
  console.log(`Will fetch ${heroIds.length} heroes`);
  
  // Define a delay between API calls to respect rate limits
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const heroId of heroIds) {
    try {
      // Add a small delay between requests
      await delay(1000);
      
      const heroData = await fetchHero(heroId);
      await saveHero(heroData);
      
      successCount++;
      console.log(`Successfully processed hero ${heroId}: ${heroData.name} (${successCount}/${heroIds.length})`);
    } catch (error) {
      errorCount++;
      console.error(`Failed to process hero ${heroId}: ${error.message}`);
    }
  }
  
  console.log('\nDatabase initialization complete!');
  console.log(`Successfully processed: ${successCount} heroes`);
  console.log(`Failed to process: ${errorCount} heroes`);
  
  // Close connection
  mongoose.disconnect();
}

// Execute the initialization
initializeDatabase();
