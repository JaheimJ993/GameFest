const express = require("express")
const router = express.Router();

const {contact, sponsor} = require("../controllers/sendMail");


router.post("/contactSubmit", contact)
router.post("/Sponsor/submitData", sponsor)



module.exports = router

