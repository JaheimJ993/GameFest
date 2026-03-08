const express = require("express")
const router = express.Router()
const path = require("path");


router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "..", "src", "client", "views", "public", "index.html"))
});

router.get("/about", (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "..", "..", "src", "client", "views", "public", "about.html"))
})

router.get("/Sponsor", (req, res) =>{
    res.sendFile(path.join(__dirname, "..", "..", "..", "src", "client", "views", "public", "sponsor.html"))
})

router.get("/Tournament-Signup", (req, res) =>{
    res.sendFile(path.join(__dirname, "..", "..", "..", "src", "client", "views", "public", "gamefest-2026.html"))
})

router.get("/2024", (req, res) =>{
    res.sendFile(path.join(__dirname, "..", "..", "..", "src", "client", "views", "public", "gamefest-2024.html" ))
})

router.get("/2025", (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "..", "..", "src", "client", "views", "public", "gamefest-2025.html" ))
})

router.get("/merch", (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "..", "..", "src", "client", "views", "public", "template.html" ))
})

router.get("/2026", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "..", "src", "client", "views", "public", "gamefest-2026.html" ))
})


module.exports = router;
