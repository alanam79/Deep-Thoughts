// import the gql tagged template function - typeDefs must be created before resolvers
const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    friendCount: Int
    thoughts: [Thought]
    friends: [User]
  }

  type Thought {
    _id: ID
    thoughtText: String
    createdAt: String
    username: String
    reactionCount: Int
    reactions: [Reaction]
  }

  type Reaction {
    _id: ID
    reactionBody: String
    createdAt: String
    username: String
  }

  # the token is not part of the USER model, so it gets added here separately
  # below means that an Auth type must return a token and can optionally include any other user data.
  type Auth {
    token: ID!
    user: User
  }

  type Query {
    me: User
    users: [User]
    user(username: String!): User
    thoughts(username: String): [Thought]
    thought(_id: ID!): Thought
  }

  type Mutation {
    # the first two are returning the Auth object
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    addThought(thoughtText: String!): Thought
    # addReaction will return the parent Thought instead of the newly created Reaction. This is because the front end will ultimately track changes on the thought level, not the reaction level.
    addReaction(thoughtId: ID!, reactionBody: String!): Thought
    addFriend(friendId: ID!): User
  }
`;

module.exports = typeDefs;

// for above code type mutation -> Both (login(email/password & addUser(username, email, password) will return a User object:
// either the user who successfully logged in or the user who was just created on sign-up.
