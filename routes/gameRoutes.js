const express = require('express');
const gameController = require('../controllers/gameController');

const router = express.Router();

router.post('/', gameController.gameStart);

module.exports = router;
