const Game = require(`../models/gameModel`);
const catchAsync = require('../utils/catchAsync');

const alphabet = 'abcdefghijklmnopqrstuvwxyz';
// const currentLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
const game = new Game({
  currentLetter: 'a',
  remainingTime: 60,
  submittedWords: [],
});

exports.gameStart = catchAsync(async (req, res, next) => {
  game.save((err, game) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    res.cookie('game', game._id, { httpOnly: true });

    res.status(200).json({
      currentLetter: game.currentLetter,
      remainingTime: game.remainingTime,
    });

    io.emit('game-started', {
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

  console.log(totalScore);
  const gameUpdate = Game.updateOne(
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
  console.log(gameUpdate);
  console.log('game ended');

  io.emit('game-ended',
    totalScore,
  );
}
