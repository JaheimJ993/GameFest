const express = require("express");
const router = express.Router();

const {games, getGamesData, upload, newGame, deleteGame} = require("../controllers/games")

router.get("/", games)

router.get("/games/data", getGamesData)

router.post('/games/new', upload.single('Uploaded-file'), newGame)

router.delete('/games/:gameId', deleteGame)


module.exports = router;