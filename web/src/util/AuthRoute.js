import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth";

// Creates a custom route that redirects the user to the home page if they are logged in
const AuthRoute = ({ element: Component, ...rest }) => {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to="/" /> : Component;
};

export default AuthRoute;
