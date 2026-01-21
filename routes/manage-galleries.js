const express = require("express");
const router = express.Router();

const {gallery2024, gallery2025} = require("../controllers/gallery.js")

router.get("/api/gallery/2024", gallery2024)
router.get("/api/gallery/2025", gallery2025)



module.exports = router;


