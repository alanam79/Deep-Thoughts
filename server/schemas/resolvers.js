const { User, Thought } = require("../models");
// error if person tries to login with wrong username or password
const { AuthenticationError } = require("apollo-server-express");
// import the signToken function
const { signToken } = require("../utils/auth");

const resolvers = {
  // query only does all the GET actions
  Query: {
    // check for the existence of context.user. If no context.user property exists, then we know that the user isn't authenticated and we can throw an AuthenticationError
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")
          .populate("thoughts")
          .populate("friends");

        return userData;
      }

      throw new AuthenticationError("Not logged in");
    },
    users: async () => {
      return User.find()
        .select("-__v -password")
        .populate("thoughts")
        .populate("friends");
    },
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select("-__v -password")
        .populate("friends")
        .populate("thoughts");
    },
    thoughts: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Thought.find(params).sort({ createdAt: -1 });
    },
    thought: async (parent, { _id }) => {
      return Thought.findOne({ _id });
    },
  },

  // these are the PUT, POST, DELETE requests
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      // update the two mutation resolvers to sign a token and return an object that combines the token with the user's data
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }
      // update the two mutation resolvers to sign a token and return an object that combines the token with the user's data
      const token = signToken(user);
      return { token, user };
    },
  },
};

module.exports = resolvers;
