const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  currentLetter: String,
  active: {
    type: Boolean,
    default: true,
  },
  submittedWords: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Word',
    },
  ],
  score: { type: Number, default: 0, max: 100 },
});

// gameSchema.pre('save', function (next) {
//   console.log(this);
// });

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;
