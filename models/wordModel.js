const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
  word: String,
  score: Number,
});

const Word = mongoose.model('Word', WordSchema);
module.exports = Word;
