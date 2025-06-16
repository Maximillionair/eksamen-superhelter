// scripts/search-api.js - Search the Superhero API and add heroes to database
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Superhero = require('../models/Superhero');
const readline = require('readline');

// API configuration
const API_BASE_URL = 'https://superheroapi.com/api';
const API_KEY = process.env.SUPERHERO_API_KEY || '827b70542b140115fb17e369951a8fef';

// Connect to MongoDB
const mongoUri = 'mongodb://10.12.87.70:27017/superhero-app';
console.log(`Connecting to MongoDB at: ${mongoUri}`);

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to database
mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected successfully');
    startSearch();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to search heroes by name
async function searchHeroByName(name) {
  try {
    console.log(`Searching for heroes with name: ${name}`);
    const response = await axios.get(`${API_BASE_URL}/${API_KEY}/search/${name}`);
    
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

// Function to save a hero to the database
async function saveHeroToDatabase(hero) {
  try {
    // Transform API data to match our schema
    const heroData = {
      id: parseInt(hero.id),
      name: hero.name,
      powerstats: {
        intelligence: hero.powerstats.intelligence,
        strength: hero.powerstats.strength,
        speed: hero.powerstats.speed,
        durability: hero.powerstats.durability,
        power: hero.powerstats.power,
        combat: hero.powerstats.combat
      },
      biography: {
        fullName: hero.biography['full-name'],
        alterEgos: hero.biography['alter-egos'],
        aliases: hero.biography.aliases,
        placeOfBirth: hero.biography['place-of-birth'],
        firstAppearance: hero.biography['first-appearance'],
        publisher: hero.biography.publisher,
        alignment: hero.biography.alignment
      },
      appearance: {
        gender: hero.appearance.gender,
        race: hero.appearance.race,
        height: hero.appearance.height,
        weight: hero.appearance.weight,
        eyeColor: hero.appearance['eye-color'],
        hairColor: hero.appearance['hair-color']
      },
      work: {
        occupation: hero.work.occupation,
        base: hero.work.base
      },
      connections: {
        groupAffiliation: hero.connections['group-affiliation'],
        relatives: hero.connections.relatives
      },
      image: {
        url: hero.image.url
      },
      fetchedAt: new Date()
    };
    
    // Check if hero already exists
    const existingHero = await Superhero.findOne({ id: heroData.id });
    
    if (existingHero) {
      // Update existing hero
      Object.assign(existingHero, heroData);
      await existingHero.save();
      console.log(`Updated hero: ${heroData.name} (ID: ${heroData.id})`);
      return existingHero;
    } else {
      // Create new hero
      const newHero = new Superhero(heroData);
      await newHero.save();
      console.log(`Added new hero: ${heroData.name} (ID: ${heroData.id})`);
      return newHero;
    }
  } catch (error) {
    console.error(`Error saving hero ${hero.name}:`, error.message);
    return null;
  }
}

// Function to handle the search process
async function startSearch() {
  console.log('=== Superhero API Search Tool ===');
  console.log('Search for heroes and add them to your database');
  console.log('Type "exit" to quit the program');
  
  // Main search loop
  async function askForSearch() {
    rl.question('\nEnter a hero name to search (or "exit" to quit): ', async (searchQuery) => {
      if (searchQuery.toLowerCase() === 'exit') {
        console.log('Goodbye!');
        rl.close();
        mongoose.disconnect();
        return;
      }
      
      if (!searchQuery.trim()) {
        console.log('Please enter a valid search term');
        return askForSearch();
      }
      
      // Perform the search
      const heroes = await searchHeroByName(searchQuery);
      
      if (heroes.length === 0) {
        console.log('No heroes found with that name');
        return askForSearch();
      }
      
      // Display results
      console.log(`\nFound ${heroes.length} heroes:`);
      heroes.forEach((hero, index) => {
        console.log(`${index + 1}. ${hero.name} (${hero.biography.publisher || 'Unknown publisher'})`);
      });
      
      // Ask which heroes to add
      rl.question('\nEnter the numbers of heroes to add (comma-separated), "all" to add all, or "none": ', async (selection) => {
        if (selection.toLowerCase() === 'none') {
          return askForSearch();
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
          console.log('No valid heroes selected');
          return askForSearch();
        }
        
        // Add selected heroes to database
        console.log(`\nAdding ${heroesToAdd.length} heroes to database...`);
        for (const hero of heroesToAdd) {
          await saveHeroToDatabase(hero);
        }
        
        console.log(`\n✓ Successfully processed ${heroesToAdd.length} heroes`);
        
        // Continue the search loop
        askForSearch();
      });
    });
  }
  
  // Start the search loop
  askForSearch();
}

// Handle program termination
process.on('SIGINT', () => {
  console.log('\nExiting program...');
  rl.close();
  mongoose.disconnect();
  process.exit(0);
});
