// scripts/seed-test-heroes.js - Seed the database with some basic test heroes
require('dotenv').config();
const mongoose = require('mongoose');
const Superhero = require('../models/Superhero');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/superhero-app')
  .then(() => console.log('MongoDB connected successfully for seeding test data'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample hero data
const testHeroes = [
  {
    id: 1001,
    name: "Test Hero 1",
    powerstats: {
      intelligence: "80",
      strength: "70",
      speed: "60",
      durability: "75",
      power: "85",
      combat: "65"
    },
    biography: {
      fullName: "Test Hero Alpha",
      alterEgos: "None",
      aliases: ["Hero Alpha", "Mr. Test"],
      placeOfBirth: "Test City, USA",
      firstAppearance: "Test Comics #1",
      publisher: "Test Comics",
      alignment: "good"
    },
    appearance: {
      gender: "Male",
      race: "Human",
      height: ["6'2", "188 cm"],
      weight: ["200 lb", "90 kg"],
      eyeColor: "Blue",
      hairColor: "Black"
    },
    work: {
      occupation: "Software Developer",
      base: "Test City"
    },
    connections: {
      groupAffiliation: "Test League",
      relatives: "None known"
    },
    image: {
      url: "https://via.placeholder.com/150?text=Test+Hero+1"
    },
    fetchedAt: new Date()
  },
  {
    id: 1002,
    name: "Test Hero 2",
    powerstats: {
      intelligence: "90",
      strength: "50",
      speed: "80",
      durability: "60",
      power: "70",
      combat: "85"
    },
    biography: {
      fullName: "Test Hero Beta",
      alterEgos: "None",
      aliases: ["Hero Beta", "Ms. Test"],
      placeOfBirth: "Test Village, Canada",
      firstAppearance: "Test Comics #2",
      publisher: "Test Comics",
      alignment: "good"
    },
    appearance: {
      gender: "Female",
      race: "Human",
      height: ["5'8", "173 cm"],
      weight: ["135 lb", "61 kg"],
      eyeColor: "Green",
      hairColor: "Red"
    },
    work: {
      occupation: "Scientist",
      base: "Test Labs"
    },
    connections: {
      groupAffiliation: "Test League",
      relatives: "None known"
    },
    image: {
      url: "https://via.placeholder.com/150?text=Test+Hero+2"
    },
    fetchedAt: new Date()
  },
  {
    id: 1003,
    name: "Test Villain",
    powerstats: {
      intelligence: "95",
      strength: "60",
      speed: "70",
      durability: "65",
      power: "90",
      combat: "75"
    },
    biography: {
      fullName: "Test Villain Gamma",
      alterEgos: "None",
      aliases: ["Dr. Evil", "The Tester"],
      placeOfBirth: "Unknown",
      firstAppearance: "Test Comics #5",
      publisher: "Test Comics",
      alignment: "bad"
    },
    appearance: {
      gender: "Male",
      race: "Meta-Human",
      height: ["6'0", "183 cm"],
      weight: ["190 lb", "86 kg"],
      eyeColor: "Red",
      hairColor: "None"
    },
    work: {
      occupation: "Mad Scientist",
      base: "Test Volcano Lair"
    },
    connections: {
      groupAffiliation: "Evil Testing League",
      relatives: "None known"
    },
    image: {
      url: "https://via.placeholder.com/150?text=Test+Villain"
    },
    fetchedAt: new Date()
  }
];

// Seed function
async function seedHeroes() {
  try {
    // Clear existing heroes
    console.log('Clearing existing test heroes...');
    await Superhero.deleteMany({ id: { $gte: 1000, $lte: 1999 } });
    
    // Insert new heroes
    console.log('Inserting test heroes...');
    const result = await Superhero.insertMany(testHeroes);
    
    console.log(`Successfully seeded ${result.length} test heroes`);
  } catch (error) {
    console.error('Error seeding test heroes:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedHeroes();
