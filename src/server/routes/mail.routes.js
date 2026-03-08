const express = require("express")
const router = express.Router();

const {contact, sponsor, cosplaySignup} = require("../controllers/mail.controller");


router.post("/contactSubmit", contact)
router.post("/Sponsor/submitData", sponsor)
router.post("/api/cosplayData", cosplaySignup)



module.exports = router

