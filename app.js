require('dotenv').config()
const express = require("express");
const path = require("path");
const app = express();

//Importing all Middleware Files
const cookieParser = require("cookie-parser");
const adminAuthRouter = require("./routes/adminAuth.cjs");
const { requireAdmin } = require("./middleware/requireAdmin.cjs");

const games = require("./routes/manage-games")
const gallery = require("./routes/manage-galleries")
const pages = require("./routes/pages")
const mail = require("./routes/SendMail")
const tournaments = require("./routes/tournaments")
const apiRegistrants = require("./routes/API-registrants")
const admin = require("./routes/admin-routes")

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")))

// Admin routers
app.get("/admin/login", (req, res)=> res.sendFile(path.join(__dirname, "views", "pages", "login.html")))
app.use("/admin/auth", adminAuthRouter)
app.use("/admin/tournaments/api", requireAdmin);
app.use("/admin", requireAdmin)

//routers
app.use("/admin/dashboard/manage-games", games)
app.use(gallery)
app.use(pages)
app.use(mail)
app.use(tournaments)
app.use(apiRegistrants)
app.use(admin)



//port the server is running on
app.listen(5000, ()=>{
    console.log("app listening on port 5000")
})

