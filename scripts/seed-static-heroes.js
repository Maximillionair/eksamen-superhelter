// scripts/seed-static-heroes.js - Seed the database with static hero data (no API calls needed)
require('dotenv').config();
const mongoose = require('mongoose');
const Superhero = require('../models/Superhero');

// Connection options with longer timeout
const options = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000
};

// Connect to MongoDB
console.log(`Attempting to connect to MongoDB at: ${process.env.MONGODB_URI}`);
mongoose.connect(process.env.MONGODB_URI, options)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample hero data - hardcoded to avoid API dependency
const heroes = [
  {
    id: 1,
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
      base: "Batcave, Stately Wayne Manor, Gotham City; Hall of Justice, Justice League Watchtower"
    },
    connections: {
      groupAffiliation: "Batman Family, Batman Incorporated, Justice League, Outsiders, Wayne Enterprises, Club of Heroes, formerly White Lantern Corps, Sinestro Corps",
      relatives: "Damian Wayne (son), Dick Grayson (adopted son), Tim Drake (adopted son), Jason Todd (adopted son), Cassandra Cain (adopted daughter), Martha Wayne (mother, deceased), Thomas Wayne (father, deceased), Alfred Pennyworth (former guardian), Roderick Kane (grandfather, deceased), Elizabeth Kane (grandmother, deceased), Thomas Wayne, Jr. (brother, deceased)"
    },
    image: {
      url: "https://www.superherodb.com/pictures2/portraits/10/100/639.jpg"
    },
    fetchedAt: new Date()
  },
  {
    id: 2,
    name: "Superman",
    powerstats: {
      intelligence: "94",
      strength: "100",
      speed: "100",
      durability: "100",
      power: "100",
      combat: "85"
    },
    biography: {
      fullName: "Clark Kent",
      alterEgos: "Superman Prime One-Million",
      aliases: ["Clark Joseph Kent", "The Man of Steel", "the Man of Tomorrow", "the Last Son of Krypton", "Big Blue", "the Metropolis Marvel", "the Action Ace"],
      placeOfBirth: "Krypton",
      firstAppearance: "ACTION COMICS #1",
      publisher: "DC Comics",
      alignment: "good"
    },
    appearance: {
      gender: "Male",
      race: "Kryptonian",
      height: ["6'3", "191 cm"],
      weight: ["225 lb", "101 kg"],
      eyeColor: "Blue",
      hairColor: "Black"
    },
    work: {
      occupation: "Reporter for the Daily Planet and novelist",
      base: "Metropolis"
    },
    connections: {
      groupAffiliation: "Justice League of America, The Legion of Super-Heroes (pre-Crisis as Superboy); Justice Society of America (pre-Crisis Earth-2 version); All-Star Squadron (pre-Crisis Earth-2 version)",
      relatives: "Lois Lane (wife), Jor-El (father, deceased), Lara (mother, deceased), Jonathan Kent (adoptive father), Martha Kent (adoptive mother)"
    },
    image: {
      url: "https://www.superherodb.com/pictures2/portraits/10/100/791.jpg"
    },
    fetchedAt: new Date()
  },
  {
    id: 3,
    name: "Spider-Man",
    powerstats: {
      intelligence: "90",
      strength: "55",
      speed: "67",
      durability: "75",
      power: "74",
      combat: "85"
    },
    biography: {
      fullName: "Peter Parker",
      alterEgos: "No alter egos found.",
      aliases: ["Spiderman", "Bag-Man", "Bombastic Bag-Man", "Captain Universe", "Dusk", "Green Hood"],
      placeOfBirth: "New York, New York",
      firstAppearance: "Amazing Fantasy #15",
      publisher: "Marvel Comics",
      alignment: "good"
    },
    appearance: {
      gender: "Male",
      race: "Human",
      height: ["5'10", "178 cm"],
      weight: ["165 lb", "74 kg"],
      eyeColor: "Hazel",
      hairColor: "Brown"
    },
    work: {
      occupation: "Freelance photographer, teacher",
      base: "New York, New York"
    },
    connections: {
      groupAffiliation: "Member of the Avengers, formerly member of Outlaws, alternate Fantastic Four",
      relatives: "Richard Parker (father, deceased), Mary Parker (mother, deceased), Benjamin Parker (uncle, deceased), May Parker (aunt), Mary Jane Watson-Parker (wife), May Parker (daughter, allegedly deceased)"
    },
    image: {
      url: "https://www.superherodb.com/pictures2/portraits/10/100/133.jpg"
    },
    fetchedAt: new Date()
  },
  {
    id: 4,
    name: "Wonder Woman",
    powerstats: {
      intelligence: "88",
      strength: "100",
      speed: "79",
      durability: "100",
      power: "100",
      combat: "100"
    },
    biography: {
      fullName: "Diana Prince",
      alterEgos: "No alter egos found.",
      aliases: ["Princess Diana", "Princess of the Amazons", "Goddess of Truth", "Diane Milton"],
      placeOfBirth: "Themyscira",
      firstAppearance: "All-Star Comics #8 (December, 1941)",
      publisher: "DC Comics",
      alignment: "good"
    },
    appearance: {
      gender: "Female",
      race: "Amazon",
      height: ["6'0", "183 cm"],
      weight: ["165 lb", "74 kg"],
      eyeColor: "Blue",
      hairColor: "Black"
    },
    work: {
      occupation: "Adventurer, Emissary to the world of Man, Protector of Paradise Island",
      base: "Paradise Island; The Hall of Justice, Justice League Watchtower"
    },
    connections: {
      groupAffiliation: "Justice League of America, Justice Society of America (pre-Crisis Earth-2 version); All-Star Squadron (pre-Crisis Earth-2 version)",
      relatives: "Queen Hippolyta (mother, deceased), Donna Troy (Troia) (magically-created duplicate)"
    },
    image: {
      url: "https://www.superherodb.com/pictures2/portraits/10/100/807.jpg"
    },
    fetchedAt: new Date()
  },
  {
    id: 5,
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
      aliases: ["Iron Knight", "Hogan Potts", "Spare Parts Man", "Cobalt Man II", "Crimson Dynamo", "Ironman"],
      placeOfBirth: "Long Island, New York",
      firstAppearance: "Tales of Suspence #39 (March, 1963)",
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
      groupAffiliation: "Avengers, Illuminati, Stark Resilient; formerly S.H.I.E.L.D., leader of Stark Enterprises, the Pro-Registration Superhero Unit, New Avengers, Mighty Avengers, Hellfire Club, Force Works, Avengers West Coast, United States Department of Defense.",
      relatives: "Howard Anthony Stark (father, deceased), Maria Stark (mother, deceased), Morgan Stark (cousin), Isaac Stark (ancestor)"
    },
    image: {
      url: "https://www.superherodb.com/pictures2/portraits/10/100/85.jpg"
    },
    fetchedAt: new Date()
  }
];

// Seed function
async function seedHeroes() {
  try {
    // Clear existing heroes first
    console.log('Clearing existing heroes...');
    await Superhero.deleteMany({});
    
    // Insert new heroes
    console.log('Inserting heroes...');
    const result = await Superhero.insertMany(heroes);
    
    console.log(`Successfully seeded ${result.length} heroes`);
  } catch (error) {
    console.error('Error seeding heroes:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedHeroes();
