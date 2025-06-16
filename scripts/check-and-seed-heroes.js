// scripts/check-and-seed-heroes.js - Check if heroes exist in the database and seed if needed
require('dotenv').config();
const mongoose = require('mongoose');
const Superhero = require('../models/Superhero');

// Connect directly to the VM MongoDB
mongoose.connect('mongodb://10.12.87.70:27017/superhero-app')
  .then(() => console.log('Connected to MongoDB at 10.12.87.70'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to check if heroes exist and seed if needed
async function checkAndSeedHeroes() {
  try {
    // Count heroes in the database
    const count = await Superhero.countDocuments();
    console.log(`Found ${count} heroes in the database`);

    // If heroes exist, list some of them
    if (count > 0) {
      const heroes = await Superhero.find().limit(5);
      console.log('\nSample heroes in database:');
      heroes.forEach(hero => {
        console.log(`- ${hero.id}: ${hero.name} (${hero.biography?.publisher || 'Unknown publisher'})`);
      });
      
      console.log('\nHeroes exist in the database. No need to seed.');
      mongoose.disconnect();
      return;
    }

    // If no heroes found, seed some test data
    console.log('No heroes found in database. Seeding test data...');
    
    // Basic test heroes
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
          placeOfBirth: "Test City",
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
        image: {
          url: "https://www.superherodb.com/pictures2/portraits/10/100/1508.jpg"
        }
      },
      {
        id: 1002,
        name: "Test Hero 2",
        powerstats: {
          intelligence: "65",
          strength: "85",
          speed: "50",
          durability: "90",
          power: "60",
          combat: "70"
        },
        biography: {
          fullName: "Test Hero Beta",
          alterEgos: "None",
          aliases: ["Hero Beta", "Ms. Test"],
          placeOfBirth: "Test Village",
          firstAppearance: "Test Comics #5",
          publisher: "Test Comics",
          alignment: "good"
        },
        appearance: {
          gender: "Female",
          race: "Human",
          height: ["5'8", "173 cm"],
          weight: ["145 lb", "65 kg"],
          eyeColor: "Green",
          hairColor: "Brown"
        },
        image: {
          url: "https://www.superherodb.com/pictures2/portraits/10/100/10.jpg"
        }
      },
      {
        id: 1003,
        name: "Test Villain",
        powerstats: {
          intelligence: "90",
          strength: "65",
          speed: "70",
          durability: "60",
          power: "95",
          combat: "80"
        },
        biography: {
          fullName: "Test Villain Gamma",
          alterEgos: "None",
          aliases: ["Villain Gamma", "Dr. Evil Test"],
          placeOfBirth: "Test Lab",
          firstAppearance: "Test Comics #12",
          publisher: "Test Comics",
          alignment: "bad"
        },
        appearance: {
          gender: "Male",
          race: "Mutant",
          height: ["6'0", "183 cm"],
          weight: ["180 lb", "81 kg"],
          eyeColor: "Red",
          hairColor: "None"
        },
        image: {
          url: "https://www.superherodb.com/pictures2/portraits/10/100/639.jpg"
        }
      }
    ];

    // Insert test heroes
    await Superhero.insertMany(testHeroes);
    console.log(`Successfully seeded ${testHeroes.length} test heroes!`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
checkAndSeedHeroes();
