import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import Link from "@mui/material/Link";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import defaultPhoto from "../images/defaultPhoto.png";
import CommentIcon from "@mui/icons-material/Comment";

import { blue } from "@mui/material/colors";
import moment from "moment";
import LikeButton from "./LikeButton";
import DeleteButton from "./DeleteButton";
import ConfirmDialog from "./ConfirmDialog";
import { DELETE_POST_MUTATION } from "../util/DeletePostQuery";
import { useMutation } from "@apollo/client";
import { FETCH_POSTS_QUERY } from "../util/FetchAllPostsQuery";

// Get the first letter of the username
const getInitial = (name, fallback = "?") =>
  name ? name.charAt(0).toUpperCase() : fallback;

function PostCard({ post }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleCommentClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/posts/${post.id}`); // Navigate to the post's page
  };

  const [isConfirmOpen, setConfirmOpen] = useState(false);

  const [deletePostMutation] = useMutation(DELETE_POST_MUTATION, {
    variables: { postId: post.id },
    update(proxy) {
      console.log("post deleted");
      const existingData = proxy.readQuery({
        query: FETCH_POSTS_QUERY,
      });
      console.log(existingData);

      const newData = {
        ...existingData,
        getPosts: existingData.getPosts.filter((p) => p.id !== post.id),
      };

      // Write the new data object back to the cache
      proxy.writeQuery({ query: FETCH_POSTS_QUERY, data: newData });
    },
    onError(err) {
      console.log(err);
    },
  });

  const openConfirmDialog = () => setConfirmOpen(true);
  const closeConfirmDialog = () => setConfirmOpen(false);

  const handleDeleteConfirmed = () => {
    deletePostMutation();
    closeConfirmDialog();
  };

  return (
    <>
      <Card
        sx={{
          border: "1px solid gray ",
          marginLeft: 10,
          marginRight: 10,
          marginBottom: 2,
        }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: blue[500] }} aria-label="post-avatar">
              {getInitial(post.username)}
            </Avatar>
          }
          //TODO: let users edit their posts / report posts
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
          title={post.username}
          subheader={
            <Link
              component={RouterLink}
              to={`/posts/${post.id}`}
              color="inherit"
              underline="none">
              {moment(parseInt(post.created_at)).fromNow()}
            </Link>
          }
        />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Avatar
            sx={{
              bgcolor: blue[500],
              width: 100, // Adjust size as needed
              height: 100, // Adjust size as needed
              border: "3px solid black", // Optional: adds a border around the circle
            }}
            alt="Post Image"
            //TODO:add image to database schema and allow users to upload their own user photo
            src={post.imageUrl || defaultPhoto}
            imgProps={{ style: { borderRadius: "50%" } }}
          />
        </Box>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {post.body}
          </Typography>
        </CardContent>

        <CardContent>
          <CardActions
            disableSpacing
            sx={{ display: "flex", alignItems: "center" }}>
            <LikeButton post={post} />

            <Tooltip
              placement="top"
              title={user ? "Leave a comment" : "Login to comment"}>
              <IconButton aria-label="comment" onClick={handleCommentClick}>
                <CommentIcon color="primary" />
              </IconButton>
            </Tooltip>

            <Typography variant="body2" color="text.secondary">
              {post.comments.length} {/* Display the comment count here */}
            </Typography>

            {/* Spacer element */}
            <Box sx={{ flexGrow: 1 }}></Box>
            {user && user.username === post.username && (
              <DeleteButton post={post} openConfirmDialog={openConfirmDialog} />
            )}
          </CardActions>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleDeleteConfirmed}
        title="Confirm Delete"
        message="Are you sure you want to delete this post?"
      />
    </>
  );
}

export default PostCard;
