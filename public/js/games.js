const path = require("path");
const viewsPath = path.join(__dirname, "..", "..", "views", "admin");
const pool = require("../../db")

const games = (req, res) => {
    res.sendFile(path.join(viewsPath, "manage-games.html"));
        console.log("Page sent successfully");

}

// This function is how we will retrieve the games that are currently stored in the database. They are displayed on a table. on the page
const getGamesData = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public."Games"');
        res.json(result.rows)
        console.log("Games returned successfully")
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Server error")

        
    }

}

module.exports = {games, getGamesData}