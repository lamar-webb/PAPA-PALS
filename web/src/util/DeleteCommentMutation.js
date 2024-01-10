import { gql } from "@apollo/client";

export const DELETE_COMMENT_MUTATION = gql`
  mutation deleteComment($postId: ID!, $commentId: ID!) {
    deleteComment(postId: $postId, commentId: $commentId) {
      id
      comments {
        id
        created_at
        body
        user {
          username
        }
      }
    }
  }
`;
