// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized. Please login." });
}

export default requireAuth;
