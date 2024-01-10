import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NavBar from "./components/NavBar";
import { Container } from "@mui/material";
import { AuthProvider } from "./context/auth.js"; // Import the AuthProvider component
import AuthRoute from "./util/AuthRoute"; // Import the AuthRoute component
import SinglePost from "./pages/SinglePost";

function App() {
  return (
    <AuthProvider>
      {" "}
      {/* Wrap the entire app with the AuthProvider component */}
      <Router>
        <Container maxWidth="lg">
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Use the AuthRoute component for the login and register routes */}
            <Route path="/login" element={<AuthRoute element={<Login />} />} />
            <Route
              path="/register"
              element={<AuthRoute element={<Register />} />}
            />
            <Route path="/posts/:postId" element={<SinglePost />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
