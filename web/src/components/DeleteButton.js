import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

export default function DeleteButton({ postId, commentId, openConfirmDialog }) {
  const isPost = !commentId;
  const handleClick = () => {
    openConfirmDialog(isPost, postId, commentId);
  };
  return (
    <Tooltip title={isPost ? "Delete Post" : "Delete Comment"}>
      <IconButton
        aria-label={isPost ? "delete post" : "delete comment"}
        onClick={handleClick}>
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  );
}
