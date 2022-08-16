const { User, Thought } = require("../models");

const resolvers = {
  // query only does GET actions
  Query: {
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
    // for mutations - POST, PUT, DELETE
    Mutation: {
      addUser: async (parent, args) => {
        const user = await User.create(args);
      
        return user;
      },
      login: async () => {},
    },
  },
};

module.exports = resolvers;
