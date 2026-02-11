require('dotenv').config()
const express = require("express");
const path = require("path");
const app = express();

//Importing all Middleware Files
const games = require("./routes/manage-games")
const gallery = require("./routes/manage-galleries")
const pages = require("./routes/pages")
const mail = require("./routes/SendMail")
const tournaments = require("./routes/tournaments")


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")))

//routers
app.use("/admin/dashboard/manage-games", games)
app.use(gallery)
app.use(pages)
app.use(mail)
app.use(tournaments)


//port the server is running on
app.listen(5000, ()=>{
    console.log("app listening on port 5000")
})

