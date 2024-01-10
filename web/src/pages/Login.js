import React, { useState, useContext } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { gql, useMutation } from "@apollo/client";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { useForm } from "../util/useForm.js";
import { AuthContext } from "../context/auth";
import Login_Register_pic from "../images/Login_Register_pic.png";
import { Avatar } from "@mui/material";

const LOGIN_USER = gql`
  mutation login($username: String!, $password: String!) {
    login(
      username: $username

      password: $password
    ) {
      id
      email
      username
      created_at
      token
    }
  }
`;

// Login component
function Login() {
  const context = useContext(AuthContext); // Access the login function from the AuthContext
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  // Destructure the values and functions returned from useForm custom hook to register a user
  const { values, handleChange, handleSubmit } = useForm(loginUserCallBack, {
    username: "",
    password: "",
  });

  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    update(_, result) {
      console.log(result);
      context.login(result.data.login); // Call the login function from the AuthContext
      navigate("/"); // Redirect to home page after successful registration
    },
    onError(err) {
      console.log(err);
      console.log(err.graphQLErrors[0].extensions.errors);
      if (err && err.graphQLErrors[0].extensions.errors) {
        setErrors(err.graphQLErrors[0].extensions.errors);
      } else {
        setErrors({ general: "An unexpected error occurred." });
      }
    },
    variables: values,
  });

  function loginUserCallBack() {
    loginUser();
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
          Login
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
            error={!!errors.username || !!errors.notFound}
            helperText={errors.username || errors.notFound || ""}
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
            error={!!errors.password || !!errors.wrongCredentials}
            helperText={errors.password || errors.wrongCredentials || ""}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}>
            Login
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Avatar
          sx={{
            width: 400, // Adjust size as needed
            height: 400, // Adjust size as needed
            border: "3px solid black", // Optional: adds a border around the circle
          }}
          alt="Post Image"
          //TODO:add image to database schema and allow users to upload their own user photo
          src={Login_Register_pic}
          imgProps={{ style: { borderRadius: "50%" } }}
        />
      </Box>
    </Container>
  );
}

export default Login;
