import dotenv from "dotenv";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";

dotenv.config();

// Initialize an Express application
const app = express();

// Define the port the Express application will listen on
//render web host port or local port
const PORT = process.env.PORT || 4000;

// Create an Apollo Server instance with your type definitions and resolvers
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return { req };
  },
});

// Start the Apollo Server before applying middleware
async function startServer() {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" });

  // Start the Express server
  app.listen(PORT, () => {
    console.log(
      `Server ready at http://localhost:4000${apolloServer.graphqlPath}`
    );
  });
}

startServer();
