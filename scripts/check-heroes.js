// scripts/check-heroes.js - Check if there are heroes in the database and seed if needed
require('dotenv').config();
const mongoose = require('mongoose');
const Superhero = require('../models/Superhero');

// Connect to MongoDB
const mongoUri = 'mongodb://10.12.87.70:27017/superhero-app';
console.log(`Connecting to MongoDB at: ${mongoUri}`);

mongoose.connect(mongoUri)
  .then(() => checkHeroes())
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function checkHeroes() {
  try {
    // Count heroes in the database
    const count = await Superhero.countDocuments();
    console.log(`Found ${count} superheroes in the database.`);
    
    if (count === 0) {
      console.log('No heroes found. Adding some test heroes...');
      
      // Sample hero data - hardcoded to avoid API dependency
      const heroes = [
        {
          id: 70,
          name: "Batman",
          powerstats: {
            intelligence: "100",
            strength: "26",
            speed: "27",
            durability: "50",
            power: "47",
            combat: "100"
          },
          biography: {
            fullName: "Bruce Wayne",
            alterEgos: "No alter egos found.",
            aliases: ["Batgirl (Yinsen)", "Batman-Bruce Wayne", "Insider", "Matches Malone"],
            placeOfBirth: "Crest Hill, Bristol Township; Gotham County",
            firstAppearance: "Detective Comics #27",
            publisher: "DC Comics",
            alignment: "good"
          },
          appearance: {
            gender: "Male",
            race: "Human",
            height: ["6'2", "188 cm"],
            weight: ["210 lb", "95 kg"],
            eyeColor: "blue",
            hairColor: "black"
          },
          work: {
            occupation: "Businessman",
            base: "Gotham City, Wayne Manor"
          },
          connections: {
            groupAffiliation: "Justice League, Batman Family",
            relatives: "Thomas Wayne (father, deceased), Martha Wayne (mother, deceased)"
          },
          image: {
            url: "https://www.superherodb.com/pictures2/portraits/10/100/639.jpg"
          }
        },
        {
          id: 332,
          name: "Iron Man",
          powerstats: {
            intelligence: "100",
            strength: "85",
            speed: "58",
            durability: "85",
            power: "100",
            combat: "64"
          },
          biography: {
            fullName: "Tony Stark",
            alterEgos: "No alter egos found.",
            aliases: ["Iron Knight", "Hogan Potts", "Spare Parts Man", "Cobalt Man II"],
            placeOfBirth: "Long Island, New York",
            firstAppearance: "Tales of Suspense #39 (March, 1963)",
            publisher: "Marvel Comics",
            alignment: "good"
          },
          appearance: {
            gender: "Male",
            race: "Human",
            height: ["6'6", "198 cm"],
            weight: ["425 lb", "191 kg"],
            eyeColor: "Blue",
            hairColor: "Black"
          },
          work: {
            occupation: "Inventor, Industrialist; former United States Secretary of Defense",
            base: "Seattle, Washington"
          },
          connections: {
            groupAffiliation: "Avengers",
            relatives: "Howard Anthony Stark (father, deceased), Maria Stark (mother, deceased)"
          },
          image: {
            url: "https://www.superherodb.com/pictures2/portraits/10/100/85.jpg"
          }
        },
        {
          id: 149,
          name: "Captain Marvel",
          powerstats: {
            intelligence: "88",
            strength: "100",
            speed: "88",
            durability: "95",
            power: "100",
            combat: "75"
          },
          biography: {
            fullName: "Carol Danvers",
            alterEgos: "Binary, Warbird",
            aliases: ["Ace", "Binary", "Lady Marvel", "Warbird"],
            placeOfBirth: "Boston, Massachusetts",
            firstAppearance: "Marvel Super-Heroes #13",
            publisher: "Marvel Comics",
            alignment: "good"
          },
          appearance: {
            gender: "Female",
            race: "Human-Kree",
            height: ["5'11", "180 cm"],
            weight: ["165 lb", "74 kg"],
            eyeColor: "Blue",
            hairColor: "Blond"
          },
          work: {
            occupation: "Former National Aeronautics and Space Administration security Chief",
            base: "Avengers Mansion"
          },
          connections: {
            groupAffiliation: "Avengers",
            relatives: "Marie Danvers (mother), Joseph Danvers, Sr. (father)"
          },
          image: {
            url: "https://www.superherodb.com/pictures2/portraits/10/100/103.jpg"
          }
        }
      ];
      
      // Insert the test heroes
      await Superhero.insertMany(heroes);
      console.log(`Added ${heroes.length} test heroes to the database.`);
    }
    
    // Print the first hero as a sample
    if (count > 0) {
      const sampleHero = await Superhero.findOne();
      console.log('Sample hero in database:');
      console.log(JSON.stringify({
        id: sampleHero.id,
        name: sampleHero.name,
        publisher: sampleHero.biography?.publisher
      }, null, 2));
    }
    
    console.log('Done!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error checking/seeding heroes:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}
