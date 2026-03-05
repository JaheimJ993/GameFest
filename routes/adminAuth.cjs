const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

const normalize = (v) => String(v ?? "").trim();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

router.post("/login", async (req, res) => {
  const email = normalize(req.body?.email).toLowerCase();
  const password = normalize(req.body?.password);

  const errors = [];
  if (!email) errors.push("Email is required.");
  else if (!isValidEmail(email)) errors.push("Email is invalid.");
  if (!password) errors.push("Password is required.");

  if (errors.length) return res.status(400).json({ message: "error", errors });

  try {
    const { data: admin, error } = await supabase
      .from("adminusers")
      .select("id, email, password_hash, role")
      .ilike("email", email)
      .single();

    if (error || !admin) {
      return res.status(401).json({ message: "error", errors: ["Invalid email or password."] });
    }

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "error", errors: ["Invalid email or password."] });
    }

    const token = jwt.sign(
      { role: admin.role, email: admin.email },
      process.env.JWT_SECRET,
      { subject: String(admin.id), expiresIn: "7d" }
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    await supabase.from("adminusers").update({ last_login_at: new Date().toISOString() }).eq("id", admin.id);

    return res.json({ message: "success" });
  } catch (err) {
    return res.status(500).json({ message: "error", errors: ["Login failed."] });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("admin_token", { path: "/" });
  return res.json({ message: "success" });
});

router.get("/me", (req, res) => {
  try {
    const token = req.cookies?.admin_token;
    if (!token) return res.status(401).json({ message: "error", errors: ["Unauthorized"] });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ message: "success", data: payload });
  } catch {
    return res.status(401).json({ message: "error", errors: ["Unauthorized"] });
  }
});

module.exports = router;
