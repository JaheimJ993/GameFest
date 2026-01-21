const path = require("path");
const viewsPath = path.join(__dirname, "..", "views", "admin");
const pool = require("../db")

//Multer allows the storing of form-uploaded files into a local directory. This is typically not allowed as it is a safety risk. We will be using multer in this situation to store the uploaded game image, and its corresponding file address in our database.
// This address is what will be referenced when delivering the data so that we can see the images displayed on our admin pages, and our front facing pages. 
const multer = require("multer")

//Serving our Page File properly
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


//firstly, we need to configure where our uploaded form files will be stored.
const imgPath = path.join(__dirname, "..", "public", "images", "game-icons")

//Next, we Use the DiskStorage engine built in with multer to set up the function where our images will be stored.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imgPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})
const upload = multer({ storage: storage })


//The Next Step is setting up the function to store the form data and add it to the database. 

const newGame = async (req, res) => {
  const gameName = req.body["game-name"];
  const gameCategory = req.body["Category"];
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Image upload failed or no image provided' });
  }

  const gameImagePath = `/images/game-icons/${file.filename}`;

  try {
    const uploadGame = await pool.query(
      'INSERT INTO public."Games" ("GameName", "Category", "Image") VALUES ($1, $2, $3)',
      [gameName, gameCategory, gameImagePath]
    );

    res.status(201).json({
      message: "Game added successfully",
      data: uploadGame.rows[0]
    });
  } catch (error) {
    console.error("Error inserting game:", error);
    res.status(500).json({ message: 'Error uploading data' });
  }
};


const deleteGame = async (req, res) => {
  const {gameId} = req.params;
  try {
    const del = await pool.query(
      `DELETE FROM public."Games" WHERE "GameID" = $1`,
      [gameId]
    );
    res.json({
      success: true,
      message: "Record Deletion Successful"
    });
  } catch (err) {
    console.error("Error deleting game:", err);
    res.status(500).json({ success: false, message: "Deletion failed" });
  }

}

module.exports = {games, getGamesData, newGame, upload, deleteGame}