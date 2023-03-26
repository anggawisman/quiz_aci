const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  currentLetter: String,
  remainingTime: Number,
  submittedWords: [WordSchema],
});

const Game = mongoose.model('Game', GameSchema);
module.exports = Game;
