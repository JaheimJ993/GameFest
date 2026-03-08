const express = require("express")
const router = express.Router();

const {submitRegistrants, getRegistrants, updateRegistrantConfirmation, deleteRegistrant} = require("../controllers/registrants.controller")

router.post("/2026/tournaments/api/register-team", submitRegistrants)
router.get("/adminPanel/tournaments/api/registrants", getRegistrants)
router.patch("/adminPanel/tournaments/api/registrants/confirmation", updateRegistrantConfirmation)
router.delete("/adminPanel/tournaments/api/registrants/:registrationId", deleteRegistrant);

module.exports = router