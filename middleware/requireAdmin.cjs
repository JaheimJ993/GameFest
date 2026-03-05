const jwt = require("jsonwebtoken");

function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.admin_token;
    if (!token) return res.status(401).json({ message: "error", errors: ["Unauthorized"] });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.sub) return res.status(401).json({ message: "error", errors: ["Unauthorized"] });

    req.admin = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: "error", errors: ["Unauthorized"] });
  }
}

module.exports = { requireAdmin };
