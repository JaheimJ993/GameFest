const express = require("express")
const router = express.Router()
const path = require("path");

router.get("/admin/tournaments", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "pages", "Registrants.html" ))
})

router.get("/admin/dashboard", (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "views", "pages", "adminPanel.html" ))
})



module.exports = router;