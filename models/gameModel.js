const mongoose = require('mongoose');
const Word = require('./wordModel');

const GameSchema = new mongoose.Schema({
  currentLetter: String,
  remainingTime: Number,
  submittedWords: [
    {
      word: String,
      score: Number,
    },
  ],
});

const Game = mongoose.model('Game', GameSchema);
module.exports = Game;
