const Game = require(`../models/gameModel`);
const catchAsync = require('../utils/catchAsync');

const alphabet = 'abcdefghijklmnopqrstuvwxyz';
const currentLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
const game = new Game({
  currentLetter,
  remainingTime: 60,
  submittedWords: [],
});

exports.gameStart = catchAsync(async (req, res, next) => {
  game.save((err, game) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    res.json({
      currentLetter: game.currentLetter,
      remainingTime: game.remainingTime,
    });

    setTimeout(() => {
      endGame(game);
    }, game.remainingTime * 1000);
  });
});

function endGame(game) {
  const totalScore = game.submittedWords.reduce((acc, word) => {
    return acc + word.score;
  }, 0);

  Game.updateOne(
    { _id: game._id },
    {
      remainingTime: 0,
      $set: { submittedWords: [] },
    },
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );

  io.emit('game-ended', {
    totalScore,
  });
}
