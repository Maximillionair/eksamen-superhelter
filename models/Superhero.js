// models/Superhero.js - Model for storing superhero data from the API
const mongoose = require('mongoose');

const PowerStatsSchema = new mongoose.Schema({
  intelligence: { type: String, default: "0" },
  strength: { type: String, default: "0" },
  speed: { type: String, default: "0" },
  durability: { type: String, default: "0" },
  power: { type: String, default: "0" },
  combat: { type: String, default: "0" }
});

const BiographySchema = new mongoose.Schema({
  fullName: { type: String, default: "" },
  alterEgos: { type: String, default: "" },
  aliases: [String],
  placeOfBirth: { type: String, default: "" },
  firstAppearance: { type: String, default: "" },
  publisher: { type: String, default: "" },
  alignment: { type: String, default: "" }
});

const AppearanceSchema = new mongoose.Schema({
  gender: { type: String, default: "" },
  race: { type: String, default: "" },
  height: [String],
  weight: [String],
  eyeColor: { type: String, default: "" },
  hairColor: { type: String, default: "" }
});

const WorkSchema = new mongoose.Schema({
  occupation: { type: String, default: "" },
  base: { type: String, default: "" }
});

const ConnectionsSchema = new mongoose.Schema({
  groupAffiliation: { type: String, default: "" },
  relatives: { type: String, default: "" }
});

const ImageSchema = new mongoose.Schema({
  url: { type: String, default: "" }
});

const SuperheroSchema = new mongoose.Schema({
  id: { 
    type: Number, 
    required: true,
    unique: true 
  },
  name: { 
    type: String, 
    required: true,
    index: true
  },
  powerstats: PowerStatsSchema,
  biography: BiographySchema,
  appearance: AppearanceSchema,
  work: WorkSchema,
  connections: ConnectionsSchema,
  image: ImageSchema,
  fetchedAt: {
    type: Date,
    default: Date.now
  },
  favoritesCount: {
    type: Number,
    default: 0
  }
});

// Create text index for searching
SuperheroSchema.index({ 
  name: 'text',
  'biography.fullName': 'text',
  'biography.publisher': 'text'
});

module.exports = mongoose.model('Superhero', SuperheroSchema);
