require('dotenv').config()
const express = require("express");
const path = require("path");
const app = express();

const { injectSpeedInsights } = require("@vercel/speed-insights")
//Importing all Middleware Files
const cookieParser = require("cookie-parser");
const adminAuthRouter = require("./routes/auth.routes.cjs");
const { requireAdmin } = require("./middleware/requireAdmin.cjs");

const galleries = require("./routes/galleries.routes")
const pages = require("./routes/public.pages.routes")
const mail = require("./routes/mail.routes")
const tournaments = require("./routes/tournaments.routes")
const registrants = require("./routes/registrants.routes")
const admin = require("./routes/admin.pages.routes")

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
app.use(galleries)
app.use(pages)
app.use(mail)
app.use(tournaments)
app.use(registrants)
app.use(admin)

injectSpeedInsights()


//port the server is running on
app.listen(5000, ()=>{
    console.log("app listening on port 5000")
})

