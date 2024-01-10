import React, { useState, useEffect, useContext } from "react";
import { IconButton, Typography } from "@mui/material";
import { gql, useMutation } from "@apollo/client";
import { green, grey } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { AuthContext } from "../context/auth";
import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Tooltip from "@mui/material/Tooltip";

function LikeButton({ post }) {
  const { user } = useContext(AuthContext);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (
      user &&
      post.likes.find((like) => like.user.username === user.username)
    ) {
      setLiked(true);
    } else setLiked(false);
  }, [user, post.likes]);

  const [likePost] = useMutation(LIKE_POST_MUTATION, {
    variables: { postId: post.id },
    onCompleted(data) {
      // Update the liked state based on the mutation result
      setLiked(
        data.likePost.likes.some((like) => like.user.username === user.username)
      );
    },
    onError(err) {
      console.log(err);
    },
  });

  const handleLike = () => {
    likePost();
  };

  const likeButton = user ? (
    liked ? (
      <Tooltip title="Unlike" placement="top">
        <IconButton aria-label="add to favorites" onClick={handleLike}>
          <FavoriteIcon style={{ color: green[500] }} />
        </IconButton>
      </Tooltip>
    ) : (
      <Tooltip title="Like" placement="top">
        <IconButton aria-label="add to favorites" onClick={handleLike}>
          <FavoriteBorderIcon style={{ color: grey[900] }} />
        </IconButton>
      </Tooltip>
    )
  ) : (
    <Tooltip title="Login to like!" placement="top">
      <IconButton
        aria-label="add to favorites"
        LinkComponent={Link}
        to="/login">
        <FavoriteBorderIcon style={{ color: grey[900] }} />
      </IconButton>
    </Tooltip>
  );

  return (
    <>
      {likeButton}
      <Typography variant="body2" color="text.secondary">
        {post.likes.length}
      </Typography>
    </>
  );
}

const LIKE_POST_MUTATION = gql`
  mutation likePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likes {
        id
        user {
          username
        }
      }
    }
  }
`;

export default LikeButton;
