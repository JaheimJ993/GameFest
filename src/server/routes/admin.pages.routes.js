const express = require("express")
const router = express.Router()
const path = require("path");

router.get("/TMS/tournaments", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "client", "views", "admin", "registrants.html" ))
})

router.get("/TMS/dashboard", (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "..", "client", "views", "admin", "dashboard.html" ))
})



module.exports = router;