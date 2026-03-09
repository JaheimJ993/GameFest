require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const adminAuthRouter = require("./src/server/routes/auth.routes.js");
const { requireAdmin } = require("./src/server/middleware/requireAdmin.js");

const galleries = require("./src/server/routes/galleries.routes");
const pages = require("./src/server/routes/public.pages.routes");
const mail = require("./src/server/routes/mail.routes");
const tournaments = require("./src/server/routes/tournaments.routes");
const registrants = require("./src/server/routes/registrants.routes");
const admin = require("./src/server/routes/admin.pages.routes");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// local static serving
app.use(express.static(path.join(__dirname, "src", "client", "public")));

// Admin routes
app.get("/admin/login", (req, res) =>
  res.sendFile(path.join(__dirname, "src", "client", "views", "admin", "login.html"))
);

app.use("/admin/auth", adminAuthRouter);
app.use("/admin/tournaments/api", requireAdmin);
app.use("/admin", requireAdmin);

// App routes
app.use(galleries);
app.use(pages);
app.use(mail);
app.use(tournaments);
app.use(registrants);
app.use(admin);

app.listen(5000, () => {
  console.log(`app listening on port 5000`);
});