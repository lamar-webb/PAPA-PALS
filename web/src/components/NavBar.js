import * as React from "react";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { AuthContext } from "../context/auth";
import { useLocation } from "react-router-dom";

export default function BasicTabs() {
  const { user, logout } = useContext(AuthContext); // Get the user and logout function from the AuthContext
  const navigate = useNavigate();
  const location = useLocation();

  // Function to determine the current tab based on the URL path
  const getValue = () => {
    switch (window.location.pathname) {
      case "/login":
        return 1;
      case "/register":
        return 2;
      default:
        return 0;
    }
  };

  // State for the currently active tab
  const [value, setValue] = useState(getValue());

  // Update the active tab whenever the location changes
  useEffect(() => {
    setValue(getValue());
  }, [location]); // Add location as a dependency

  // Handle changing of tabs
  const handleChange = (event, newValue) => {
    setValue(newValue);
    // Navigate to the corresponding route based on the new tab value
    switch (newValue) {
      case 0:
        navigate("/");
        break;
      case 1:
        navigate("/login");
        break;
      case 2:
        navigate("/register");
        break;
      default:
        break;
    }
  };

  // Render different tabs based on user authentication status
  const menuBar = user ? (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={getValue()} // Call the function to get the current tab value
          onChange={handleChange} // Call the handleChange function when the tab changes
          aria-label="Nav bar"
          variant="fullWidth">
          <Tab label={user.username} />
          <Tab label="" />
          <Tab label="Logout" onClick={logout} />
        </Tabs>
      </Box>
    </Box>
  ) : (
    // If user is not logged in, show general tabs
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value} // Call the function to get the current tab value
          onChange={handleChange}
          aria-label="Nav bar"
          variant="fullWidth">
          <Tab label="Home" />
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
      </Box>
    </Box>
  );

  return menuBar;
}
