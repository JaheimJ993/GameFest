const express = require("express")
const router = express.Router()
const path = require("path");

const {submitRegistrants, getRegistrants, updateRegistrantConfirmation, deleteRegistrant} = require("../controllers/API-registrants")

router.post("/2026/tournaments/api/register-team", submitRegistrants)
router.get("/admin/tournaments/api/registrants", getRegistrants)
router.patch("/admin/tournaments/api/registrants/confirmation", updateRegistrantConfirmation)
router.delete("/admin/tournaments/api/registrants/:registrationId", deleteRegistrant);

router.get("/admin/tournaments", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "pages", "Registrants.html" ))
})

router.get("/admin/dashboard", (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "views", "pages", "adminPanel.html" ))
})



module.exports = router;