import gql from "graphql-tag";

export const FETCH_POST_QUERY = gql`
  query ($postId: ID!) {
    getPost(postId: $postId) {
      body
      id
      created_at
      username

      comments {
        body
        created_at
        id
        user {
          username
        }
      }
      likes {
        id
        user {
          username
        }
      }
    }
  }
`;
