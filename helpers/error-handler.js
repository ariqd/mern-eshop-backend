function errorHandler(err, req, res, next) {
  // JWT Authentication error
  if (err?.name === "UnauthorizedError")
    return res.status(401).json({ message: "The user is not authenticated!" });

  // Validation error
  if (err?.name === "ValidationError")
    return res.status(401).json({ message: err });

  return res?.status(500).json(err);
}

module.exports = errorHandler;
