const express = require("express")
const router = express.Router();

const {submitRegistrants, getRegistrants, updateRegistrantConfirmation, deleteRegistrant} = require("../controllers/registrants.controller")

router.post("/2026/tournaments/api/register-team", submitRegistrants)
router.get("/TMS/tournaments/api/registrants", getRegistrants)
router.patch("/TMS/tournaments/api/registrants/confirmation", updateRegistrantConfirmation)
router.delete("/TMS/tournaments/api/registrants/:registrationId", deleteRegistrant);

module.exports = router