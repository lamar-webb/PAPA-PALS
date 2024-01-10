import React, { useState, useContext } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { gql, useMutation } from "@apollo/client";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { useForm } from "../util/useForm.js";
import { AuthContext } from "../context/auth";

//graphql mutation to register a user
const REGISTER_USER = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      registerInput: {
        username: $username
        email: $email
        password: $password
        confirm_password: $confirmPassword
      }
    ) {
      id
      email
      username
      created_at
      token
    }
  }
`;

// Register component
function Register() {
  const context = useContext(AuthContext); // Access the login function from the AuthContext
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  // Destructure the values and functions returned from useForm custom hook to register a user
  const { values, handleChange, handleSubmit } = useForm(registerUser, {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [addUser, { loading }] = useMutation(REGISTER_USER, {
    update(_, result) {
      console.log(result);
      context.login(result.data.register); // Call the login function from the AuthContext
      navigate("/"); // Redirect to home page after successful registration
    },
    onError(err) {
      if (err && err.graphQLErrors[0].extensions.errors) {
        setErrors(err.graphQLErrors[0].extensions.errors);
      } else {
        setErrors({ general: "An unexpected error occurred." });
      }
    },
    variables: values,
  });

  function registerUser() {
    addUser();
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        {loading && <CircularProgress size={50} color="secondary" />}
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={values.username}
            onChange={handleChange("username")}
            error={!!errors.username}
            helperText={errors.username || ""}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange("email")}
            error={!!errors.email}
            helperText={errors.email || ""}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange("password")}
            error={!!errors.password}
            helperText={errors.password || ""}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirm-password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword || ""}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}>
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Register;
