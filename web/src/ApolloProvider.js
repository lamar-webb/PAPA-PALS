import React from "react";
import App from "./App.js";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createHttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  //This points to our gpahql server - which is running on port 4000 locally
  uri: "http://localhost:4000/graphql",
});

//This is a middleware that will run before every request  -
// it will set the authorization header with the token if it exists in local storage
//this will automatically be sent to the server with every request (if it exists) - create post, delete post, etc
const authLink = setContext(() => {
  const token = localStorage.getItem("jwtToken");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export const ApolloProviderComponent = () => (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
