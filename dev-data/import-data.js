const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Word = require('../models/wordModel');

dotenv.config({ path: './.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection success');
  });

//READ JSON FILE
const words = JSON.parse(fs.readFileSync(`${__dirname}/words.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Word.create(words);
    console.log('Data has been imported successfuly!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM COLLECTION/DB
const deleteData = async () => {
  try {
    await Word.deleteMany();
    console.log('Data has been deleted successfuly!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Basic app with cli
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// run with node ex: node dev-data/import-data.js --import

console.log(process.argv);
