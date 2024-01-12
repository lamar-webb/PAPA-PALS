import React from "react";
import { useContext, useState, useRef } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { AuthContext } from "../context/auth";
import moment from "moment";
import {
  Card,
  CardHeader,
  Avatar,
  Typography,
  Box,
  CardContent,
  TextField,
  Button,
  CardActions,
  Grid,
} from "@mui/material";
import { blue } from "@mui/material/colors";

import SendIcon from "@mui/icons-material/Send";
import LikeButton from "../components/LikeButton";
import DeleteButton from "../components/DeleteButton";
import { FETCH_POST_QUERY } from "../util/FetchSinglePostQuery";
import { CREATE_COMMENT_MUTATION } from "../util/createCommentMutation";
import { DELETE_POST_MUTATION } from "../util/DeletePostQuery";
import ConfirmDialog from "../components/ConfirmDialog";
import { FETCH_POSTS_QUERY } from "../util/FetchAllPostsQuery";
import { DELETE_COMMENT_MUTATION } from "../util/DeleteCommentMutation";
import defaultPhoto from "../images/defaultPhoto.png";

function SinglePost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const commentInputRef = useRef(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [deleteContext, setDeleteContext] = useState({
    isPostToDelete: true,
    postId: null,
    commentId: null,
  });
  const [comment, setComment] = useState("");

  const { loading, data, error } = useQuery(FETCH_POST_QUERY, {
    variables: {
      postId: postId,
    },
  });

  const [deletePostMutation] = useMutation(DELETE_POST_MUTATION, {
    update(proxy) {
      console.log("post deleted");
      navigate("/");

      try {
        const existingData = proxy.readQuery({
          query: FETCH_POSTS_QUERY,
        });
        console.log(existingData);

        // Check if the existingData is valid
        if (existingData && existingData.getPosts) {
          const newData = {
            ...existingData,
            getPosts: existingData.getPosts.filter((p) => p.id !== post.id),
          };

          // Write the new data object back to the cache
          proxy.writeQuery({ query: FETCH_POSTS_QUERY, data: newData });
        } else {
          console.error(
            "Unable to update the cache as existing data is null or invalid."
          );
        }
      } catch (err) {
        console.error("Error while updating the cache:", err);
      }
    },
    onError(err) {
      console.log(err);
    },
  });

  const [submitComment] = useMutation(CREATE_COMMENT_MUTATION, {
    update(proxy, result) {
      try {
        // Read the current post data from the cache
        const data = proxy.readQuery({
          query: FETCH_POST_QUERY,
          variables: { postId },
        });

        // Ensure data and data.getPost are valid
        if (!data || !data.getPost) {
          throw new Error("Post data not found in the cache");
        }

        // Create a new comments array with the new comment
        const newComments = data.getPost.comments
          ? [result.data.createComment, ...data.getPost.comments]
          : [result.data.createComment];

        // Write the updated data back to the cache
        proxy.writeQuery({
          query: FETCH_POST_QUERY,
          data: {
            ...data,
            getPost: {
              ...data.getPost,
              comments: newComments,
            },
          },
          variables: { postId },
        });

        // Reset the comment input field
        setComment("");
        if (commentInputRef.current) {
          commentInputRef.current.blur();
        }
      } catch (err) {
        console.error(
          "Error updating the cache after submitting a comment:",
          err
        );
      }
    },
    variables: {
      postId: postId,
      body: comment,
    },
  });

  const [deleteCommentMutation] = useMutation(DELETE_COMMENT_MUTATION, {
    update(proxy, result) {
      try {
        // Read the existing post data from the cache
        const existingData = proxy.readQuery({
          query: FETCH_POST_QUERY,
          variables: { postId },
        });

        // Ensure existingData and existingData.getPost.comments are valid
        if (
          !existingData ||
          !existingData.getPost ||
          !Array.isArray(existingData.getPost.comments)
        ) {
          throw new Error(
            "Existing post data is invalid or not found in the cache"
          );
        }

        // Filter out the deleted comment
        const updatedComments = existingData.getPost.comments.filter(
          (comment) => comment.id !== deleteContext.commentId
        );

        // Write the updated comments back to the cache
        proxy.writeQuery({
          query: FETCH_POST_QUERY,
          data: {
            ...existingData,
            getPost: {
              ...existingData.getPost,
              comments: updatedComments,
            },
          },
          variables: { postId },
        });
      } catch (err) {
        console.error(
          "Error updating the cache after deleting a comment:",
          err
        );
      }
    },
    onError(err) {
      console.log(err);
    },
  });

  if (error) {
    console.error("Error fetching the post:", error);
    navigate("/");
  }

  if (loading) {
    return <p>Loading post...</p>;
  }

  if (!data || !data.getPost) {
    return <p>Post not found</p>;
  }

  const { getPost: post } = data;

  const openConfirmDialog = (isPost, postId, commentId) => {
    setDeleteContext({ isPostToDelete: isPost, postId, commentId });
    setConfirmOpen(true);
  };
  const closeConfirmDialog = () => setConfirmOpen(false);

  const handleDeleteConfirmed = () => {
    if (deleteContext.isPostToDelete) {
      deletePostMutation({ variables: { postId: post.id } });
    } else {
      deleteCommentMutation({
        variables: { postId: post.id, commentId: deleteContext.commentId },
      });
    }

    closeConfirmDialog();
  };

  return (
    <Grid sx={{ margin: 10 }}>
      <Grid item xs={12} sm={12} md={12} lg={12}>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{ marginBottom: 10 }}>
          Back to home page
        </Button>
      </Grid>

      <Grid item xs={12} sm={12} md={12} lg={12}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Avatar
            sx={{
              bgcolor: blue[500],
              width: 100,
              height: 100,
              border: "3px solid black",
            }}
            alt="Profile Picture"
            //TODO: user photo feature
            src={post.userImageUrl || defaultPhoto}
          />
        </Box>
        <Typography variant="h6" align="center">
          {post.username}
        </Typography>
        {/* TODO: user bio*/}
      </Grid>
      <Card sx={{ margin: 2 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: blue[500] }}>
              {post.username.charAt(0).toUpperCase()}
            </Avatar>
          }
          action={
            user &&
            user.username === post.username && (
              <DeleteButton
                postId={post.id}
                openConfirmDialog={openConfirmDialog}
              />
            )
          }
          title={post.username}
          subheader={moment(post.createdAt).fromNow()}
        />
        <CardContent>
          <Typography variant="body1">{post.body}</Typography>
        </CardContent>
        <CardActions>
          <LikeButton user={user} post={post} />
        </CardActions>
        {user && (
          <Card>
            <CardContent>
              <TextField
                fullWidth
                type="text"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                ref={commentInputRef}
              />
            </CardContent>
            <CardActions>
              <Button
                onClick={submitComment}
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                disabled={comment.trim() === ""}>
                Submit
              </Button>
            </CardActions>
          </Card>
        )}
      </Card>
      {/* Comments Section */}
      <Grid container spacing={2}>
        {post.comments.map((comment) => (
          <Grid item xs={12} key={comment.id}>
            <Card
              sx={{
                padding: 2,
                marginBottom: 2,
                marginLeft: 2,
                marginRight: 2,
              }}>
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <Box>
                  <Typography variant="body1">{comment.body}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {comment.user.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {moment(comment.createdAt).fromNow()}
                  </Typography>
                </Box>
                {user && user.username === comment.user.username && (
                  <DeleteButton
                    postId={post.id}
                    commentId={comment.id}
                    openConfirmDialog={openConfirmDialog}
                    sx={{ alignSelf: "start" }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleDeleteConfirmed}
        title="Confirm Delete"
        message="Are you sure you want to delete this post?"
      />
    </Grid>
  );
}

export default SinglePost;
