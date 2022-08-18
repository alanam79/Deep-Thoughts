// JSON WEB TOKEN (JWT)
const jwt = require("jsonwebtoken");

// Tokens can be given an expiration date and a secret to sign the token with. Note that the secret has nothing to do with encoding.
// The secret merely enables the server to verify whether it recognizes this token.
const secret = "mysecretsshhhhh";
const expiration = "2h";

module.exports = {
  authMiddleware: function ({ req }) {
    // allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // separate "Bearer" from "<tokenvalue>"
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    // if no token, return request object as is
    if (!token) {
      return req;
    }

    try {
      // decode and attach user data to request object - If the secret on jwt.verify() doesn't match the secret that was used with jwt.sign(), the object won't be decoded.
      // used the try/catch method to mute the error that is thrown and will manually throw an error on the resolver side
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log("Invalid token");
    }

    // return updated request object
    return req;
  },
  // function expects a user object and will add that user's username, email, and _id properties to the token
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
