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
      const data = proxy.readQuery({
        query: FETCH_POSTS_QUERY,
      });
      // Create a new object for the updated data
      const newData = {
        ...data,
        getPosts: [result.data.createPost, ...data.getPosts],
      };
      proxy.writeQuery({ query: FETCH_POSTS_QUERY, data: newData });
      values.body = "";
    },
  });

  function createPostCallBack() {
    createPost().catch((err) =>
      console.log(err, "this is the error from post form")
    );
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
        helperText={error ? error.graphQLErrors[0].message : ""}
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

//TODO: when the user start to type the error message should disappear
//TODO: handle the error os making a post when the token is expired, user should be redirected to the sign in page
