const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const gameRouter = require('./routes/gameRoutes');
const Game = require(`./models/gameModel`);
const Word = require(`./models/wordModel`);
const catchAsync = require('./utils/catchAsync');

const alphabet = 'abcdefghijklmnopqrstuvwxyz';
const currentLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
const game = new Game({
  currentLetter,
  remainingTime: 60,
  submittedWords: [],
});

dotenv.config({ path: './.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const app = express();

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
// const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// socket io
io.on('connection', (socket) => {
  socket.on('startGame', (data) => {
    console.log('data => ', data);
  });
  socket.on('findWord', async (data) => {
    console.log(data);
    const findWord = await Word.findOne({ word: data }, (err) => {
      if (err) {
        console.error(err);
      }
    });
    if (!findWord) {
      socket.emit('wordFinded', {
        confirm: 'null',
      });
    } else {
      socket.emit('wordFinded', {
        confirm: 'finded',
        word: findWord.word,
        score: findWord.score,
      });
    }
    console.log(findWord);
  });
  socket.on('submitWord', (data) => {
    console.log('data submit => ', data);
    Game.findOneAndUpdate(
      { _id: data.game },
      {
        $push: {
          submittedWords: { word: `${data.word}`, score: `${data.score}` },
        },
      },
      { new: true },
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );
  });
  console.log('socket connect!');
});

// define template view engine
app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/', (req, res) => {
  res.render('game', { title: 'Hayo ' });
});
app.post('/api/v1/start', (req, res) => {
  game.save((err, game) => {
    console.log('di save');
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    res.status(200).json({
      currentLetter: game.currentLetter,
      remainingTime: game.remainingTime,
    });

    io.emit('game-started', {
      gameId: game._id,
      currentLetter: game.currentLetter,
      remainingTime: game.remainingTime,
    });
    console.log(game);

    setTimeout(() => {
      endGame(game);
    }, game.remainingTime * 1000);
  });
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

async function endGame(game) {
  const totalScore = game.submittedWords.reduce((acc, word) => {
    return acc + word.score;
  }, 0);

  console.log(totalScore);
  const gameUpdate = await Game.findOneAndUpdate(
    { _id: game._id },
    {
      remainingTime: 0,
      // $set: { submittedWords: [] },
      // $push: { pic_action: `${req.body.pic_action_update}` },
    },
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
  console.log('game ended');
  io.emit('game-started', {
    remainingTime: gameUpdate.remainingTime,
    currentLetter: gameUpdate.currentLetter,
  });

  io.emit('game-ended', {
    totalScore,
  });
}
