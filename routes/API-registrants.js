const express = require("express")
const router = express.Router();

const {submitRegistrants, getRegistrants} = require("../controllers/API-registrants")

router.post("/2026/tournaments/api/register-team", submitRegistrants)
router.get("/adminPanel/tournaments/api/registrants", getRegistrants)

module.exports = router