const jwt = require('jsonwebtoken');
const User = require('../schemas/UserSchema');
const JWT_SECRET = process.env.JWT_SECRET; // Store this securely

const auth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1]; 

    if (!token) {
      return res.status(403).send({ Message: "Forbidden: No token provided", Success: false });
    }

    // Verify the token and get the payload
    jwt.verify(token, JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        return res.status(403).send({ Message: "Forbidden: Invalid token", Success: false });
      }

      // Use the ID from the decoded token to find the user in the database
      const user = await User.findById(decodedToken.id);
      if (!user) {
        return res.status(400).send({ Message: "Unauthorized: User not found", Success: false });
      }

      // Attach the full user object to req.user
      req.user = user;
      req.token = token;

      next(); // Move on to the next middleware or route
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send({ Message: error.message, Success: false });
  }
};

module.exports = auth;
