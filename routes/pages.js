const express = require("express")
const router = express.Router()
const path = require("path");


router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

router.get("/about", (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "views", "pages", "about.html"))
})

router.get("/dashboard", (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "views", "pages", "dashboard.html"))
})
router.get("/Store", (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "views", "pages", "Store.html"))
})

router.get("/Sponsor", (req, res) =>{
    res.sendFile(path.join(__dirname, "..", "views", "pages", "sponsor.html"))
})
router.get("/Tournament-Signup", (req, res) =>{
    res.sendFile(path.join(__dirname, "..", "views", "pages", "register.html"))
})

router.get("/admin/dashboard", (req, res) =>{
    res.sendFile(path.join(__dirname, "..", "views", "admin", "dashboard.html" ))
})

router.get("/2024", (req, res) =>{
    res.sendFile(path.join(__dirname, "..", "views", "pages", "2024.html" ))
})

router.get("/2025", (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "views", "pages", "2025.html" ))
})
router.get("/Purchase%20Tickets", (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "views", "pages", "Tickets.html" ))
})

router.get("/merch", (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "views", "pages", "merchItems", "template.html" ))
})
module.exports = router;
