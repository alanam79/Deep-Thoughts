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
    // Only logged-in users should be able to use this mutation, hence why we check for the existence of context.user first. Remember, the decoded JWT is only added to context if the verification passes. The token includes the user's username, email, and _id properties, which become properties of context.user and can be used in the follow-up Thought.create() and User.findByIdAndUpdate() methods.
    addThought: async (parent, args, context) => {
      if (context.user) {
        const thought = await Thought.create({
          ...args,
          username: context.user.username,
        });

        // without the { new: true } flag in User.findByIdAndUpdate(), Mongo would return the original document instead of the updated document.
        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { thoughts: thought._id } },
          { new: true }
        );

        return thought;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
    addReaction: async (parent, { thoughtId, reactionBody }, context) => {
      if (context.user) {
        const updatedThought = await Thought.findOneAndUpdate(
          { _id: thoughtId },
          {
            $push: {
              reactions: { reactionBody, username: context.user.username },
            },
          },
          { new: true, runValidators: true }
        );

        return updatedThought;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
    // This mutation will look for an incoming friendId and add that to the current user's friends array. A user can't be friends with the same person twice, though, hence why we're using the $addToSet operator instead of $push to prevent duplicate entries.
    addFriend: async (parent, { friendId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { friends: friendId } },
          { new: true }
        ).populate("friends");

        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
