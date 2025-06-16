// scripts/fetch-heroes.js - Simple script to fetch heroes from Superhero API
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Superhero = require('../models/Superhero');
const readline = require('readline');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to MongoDB
const mongoUri = 'mongodb://10.12.87.70:27017/superhero-app';
console.log(`Connecting to MongoDB at: ${mongoUri}`);

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Superhero API configuration
const API_BASE_URL = 'https://superheroapi.com/api';
const API_KEY = process.env.SUPERHERO_API_KEY || '827b70542b140115fb17e369951a8fef';

// Transform API data to match our schema
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

// Fetch hero by ID from the API
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

// Save or update hero in database
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

// Search for heroes by name
async function searchHeroes(query) {
  try {
    console.log(`Searching for heroes with name: ${query}`);
    const response = await axios.get(`${API_BASE_URL}/${API_KEY}/search/${query}`);
    
    if (response.data.response === 'error') {
      console.log(`Error: ${response.data.error}`);
      return [];
    }
    
    return response.data.results || [];
  } catch (error) {
    console.error('Error searching heroes:', error.message);
    return [];
  }
}

// Main menu
function showMainMenu() {
  console.log('\n===== SUPERHERO API FETCHER =====');
  console.log('1. Fetch hero by ID');
  console.log('2. Search heroes by name');
  console.log('3. Initialize database with popular heroes');
  console.log('4. Exit');
  
  rl.question('\nSelect an option (1-4): ', (answer) => {
    switch(answer) {
      case '1':
        fetchHeroById();
        break;
      case '2':
        searchHeroesByName();
        break;
      case '3':
        initializeDatabase();
        break;
      case '4':
        console.log('Goodbye!');
        rl.close();
        mongoose.disconnect();
        break;
      default:
        console.log('Invalid option. Please try again.');
        showMainMenu();
    }
  });
}

// Fetch hero by ID
function fetchHeroById() {
  rl.question('Enter hero ID (1-731): ', async (heroId) => {
    const id = parseInt(heroId);
    
    if (isNaN(id) || id < 1 || id > 731) {
      console.log('Invalid ID. Please enter a number between 1 and 731.');
      return showMainMenu();
    }
    
    try {
      const heroData = await fetchHero(id);
      await saveHero(heroData);
      console.log(`Successfully added ${heroData.name} to the database!`);
    } catch (error) {
      console.error('Failed to fetch and save hero:', error.message);
    }
    
    showMainMenu();
  });
}

// Search heroes by name
function searchHeroesByName() {
  rl.question('Enter hero name to search: ', async (query) => {
    if (!query.trim()) {
      console.log('Please enter a valid search term.');
      return showMainMenu();
    }
    
    try {
      const heroes = await searchHeroes(query);
      
      if (heroes.length === 0) {
        console.log('No heroes found with that name.');
        return showMainMenu();
      }
      
      console.log(`\nFound ${heroes.length} heroes:`);
      heroes.forEach((hero, index) => {
        console.log(`${index + 1}. ${hero.name} (${hero.biography.publisher || 'Unknown'}) [ID: ${hero.id}]`);
      });
      
      rl.question('\nEnter the numbers to add (comma-separated), "all" to add all, or "none": ', async (selection) => {
        if (selection.toLowerCase() === 'none') {
          return showMainMenu();
        }
        
        let heroesToAdd = [];
        if (selection.toLowerCase() === 'all') {
          heroesToAdd = heroes;
        } else {
          const selectedIndexes = selection.split(',')
            .map(s => parseInt(s.trim()) - 1)
            .filter(i => !isNaN(i) && i >= 0 && i < heroes.length);
          
          heroesToAdd = selectedIndexes.map(i => heroes[i]);
        }
        
        if (heroesToAdd.length === 0) {
          console.log('No valid heroes selected.');
          return showMainMenu();
        }
        
        console.log(`\nAdding ${heroesToAdd.length} heroes to database...`);
        for (const hero of heroesToAdd) {
          const heroData = transformApiData(hero);
          await saveHero(heroData);
        }
        
        console.log(`Successfully added ${heroesToAdd.length} heroes to the database!`);
        showMainMenu();
      });
    } catch (error) {
      console.error('Error:', error.message);
      showMainMenu();
    }
  });
}

// Initialize database with popular heroes
async function initializeDatabase() {
  // List of popular hero IDs to fetch
  const heroIds = [
    60,   // Batman
    620,  // Spider-Man
    644,  // Superman
    659,  // Thor
    332,  // Iron Man
    655,  // Thanos
    149,  // Captain Marvel
    370,  // Joker
    106,  // Captain America
    714,  // Wonder Woman
  ];
  
  console.log(`Initializing database with ${heroIds.length} popular heroes...`);
  
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
  
  showMainMenu();
}

// Start the script
showMainMenu();

// Handle program termination
process.on('SIGINT', () => {
  console.log('\nExiting program...');
  rl.close();
  mongoose.disconnect();
  process.exit(0);
});
