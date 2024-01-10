import gql from "graphql-tag";

export const CREATE_COMMENT_MUTATION = gql`
  mutation createComment($postId: String!, $body: String!) {
    createComment(postId: $postId, body: $body) {
      body
      created_at
      id
      user {
        username
      }
    }
  }
`;
