const User = require('../schemas/UserSchema')

const auth = async (req, res, next) => {
    try {
      if (req.session.userObject) {
        const user = await User.findOne({
          username: req.session.userObject.username,
        });
  
        if (!user) {
          return res.status(400).send({ Message: "Unauthorized", Success: false });
        }
  
        req.user = user;
        next(); // Move to the next middleware/route handler only if user exists.
      } else {
        return res.status(400).send({ Message: "Unauthorized", Success: false });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send({ Message: error.message, Success: false });
    }
  };
  

module.exports = auth;