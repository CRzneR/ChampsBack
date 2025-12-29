const jwt = require("jsonwebtoken");

module.exports = function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token fehlt." });
  }

  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET fehlt auf Render!");
    return res.status(500).json({ message: "JWT_SECRET fehlt auf dem Server." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    console.error("❌ JWT verify failed:", err.message);
    return res.status(401).json({ message: "Ungültiges Token." });
  }
};
