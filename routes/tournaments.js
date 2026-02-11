const express = require("express")
const router = express.Router();
const path = require("path");

const { newTournament, getTournaments, getTournament } = require('../controllers/tourneyApi')

router.post("/admin/newTournament", newTournament )
router.get("/admin/api/getTournaments", getTournaments)
router.get("/2026/api/get-tournament", getTournament )

router.get("/2026/tournaments/", (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "views", "pages", "2026-details.html" ))
})


module.exports = router