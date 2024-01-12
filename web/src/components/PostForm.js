import React, { useContext } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { AuthContext } from "../context/auth";
import { useForm } from "../util/useForm";
import gql from "graphql-tag";
import { useMutation } from "@apollo/client";
import { FETCH_POSTS_QUERY } from "../util/FetchAllPostsQuery";

function PostForm() {
  const { user } = useContext(AuthContext);
  const { handleChange, handleSubmit, values } = useForm(createPostCallBack, {
    body: "",
  });

  const [createPost, { error }] = useMutation(CREATE_POST_MUTATION, {
    variables: values,
    update(proxy, result) {
      try {
        const data = proxy.readQuery({
          query: FETCH_POSTS_QUERY,
        });

        if (data) {
          const newData = {
            ...data,
            getPosts: [result.data.createPost, ...data.getPosts],
          };

          proxy.writeQuery({ query: FETCH_POSTS_QUERY, data: newData });
          values.body = "";
        }
      } catch (err) {
        console.error("Error while updating the cache:", err);
        // Handle the error, e.g., by refetching the query or showing an error message
      }
    },
  });

  function createPostCallBack() {
    createPost();
  }

  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { mb: 2 },
        "& .MuiButton-root": { ml: "auto", display: "block" },
        marginBottom: 2,
        marginTop: 5,
      }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Make a new post!
      </Typography>

      <TextField
        fullWidth
        id="post-content"
        label={`What's on your mind, ${user.username}?`}
        multiline
        rows={4}
        value={values.body}
        onChange={handleChange("body")}
        variant="outlined"
        error={error ? true : false}
        helperText={error ? "Something went wrong :(" : ""}
      />
      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={values.body.trim() === ""}>
        Post
      </Button>
    </Box>
  );
}

const CREATE_POST_MUTATION = gql`
  mutation createPost($body: String!) {
    createPost(body: $body) {
      id
      body
      created_at
      username
      likes {
        id
        user {
          username
        }
        created_at
      }
      comments {
        id
        body
        user {
          username
        }
        created_at
      }
    }
  }
`;

export default PostForm;
