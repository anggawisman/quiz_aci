const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const Game = require(`./models/gameModel`);
const Word = require(`./models/wordModel`);
const catchAsync = require('./utils/catchAsync');
const app = express();

dotenv.config({ path: './.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// HANDLE ERROR CATCHING UNCAUGHT EXCEPTIONS
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTIONS !!! Shuting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    // live DB
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB connection success');
  })
  .catch((err) => console.log('ERROR BRO DB NYA'));

// 4) START SERVER

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

const { Server } = require('socket.io');
const io = new Server(server);

// socket io
io.on('connection', (socket) => {
  socket.on('startGame', async (data) => {
    if (data === 'start') {
      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
      const currentLetter =
        alphabet[Math.floor(Math.random() * alphabet.length)];

      const game = await Game.create({
        currentLetter: currentLetter,
        submittedWords: [],
      });

      console.log('ini sabi?', game);
      socket.emit('game-started', {
        gameId: game._id,
        currentLetter: game.currentLetter,
      });
    }
  });

  socket.on('findWord', async ({ word, gameId }) => {
    console.log('word', word);
    console.log('gameId', gameId);

    const findWord = await Word.findOne({ word: word });
    const game = await Game.findOne({ _id: gameId });
    if (!findWord) {
      socket.emit('wordFinded', {
        confirm: 'null',
      });
    } else if (game.submittedWords.indexOf(`${findWord._id}`) > -1) {
      socket.emit('wordFinded', {
        confirm: 'duplicate',
      });
    } else {
      socket.emit('wordFinded', {
        confirm: 'finded',
        // word: findWord.word,
        // score: findWord.score,
      });

      const sumScore = game.score + findWord.score;

      Game.findOneAndUpdate(
        { _id: gameId },
        {
          score: sumScore,
          $push: {
            submittedWords: findWord._id,
          },
        },
        { new: true },
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
    }
    console.log(findWord);
  });

  socket.on('gameOver', async ({ gameIdSave }) => {
    if (gameIdSave === null) {
      console.log('iya nih');
      return;
    }
    const game = await Game.findOne({ _id: gameIdSave });
    socket.emit('gameSummary', {
      words: game.submittedWords,
      score: game.score,
    });
    console.log('gameOver', gameIdSave);
  });

  console.log('socket connect!');
});

// define template view engine
app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/', (req, res) => {
  res.render('game', { title: 'Hayo ' });
});

// HANDLE ERROR OUTSIDE EXPRESS: UNDHANDLE REJECTION
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION !!! Shuting down...');
  server.close(() => {
    // doing server.close, we give the server time to finish all the request that are still pending or being handled at the time.
    process.exit(1);
  });
});

// async function endGame(game) {
//   const totalScore = game.submittedWords.reduce((acc, word) => {
//     return acc + word.score;
//   }, 0);

//   console.log(totalScore);
//   const gameUpdate = await Game.findOneAndUpdate(
//     { _id: game._id },
//     {
//       remainingTime: 0,
//       // $set: { submittedWords: [] },
//       // $push: { pic_action: `${req.body.pic_action_update}` },
//     },
//     (err) => {
//       if (err) {
//         console.error(err);
//       }
//     }
//   );
//   console.log('game ended');
//   io.emit('game-started', {
//     remainingTime: gameUpdate.remainingTime,
//     currentLetter: gameUpdate.currentLetter,
//   });

//   io.emit('game-ended', {
//     totalScore,
//   });
// }
