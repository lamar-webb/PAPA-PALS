import gql from "graphql-tag";

export const FETCH_POSTS_QUERY = gql`
  query {
    getPosts {
      id
      body
      created_at
      username
      comments {
        id
        body
        created_at
        user {
          username
        }
      }
      likes {
        user {
          username
        }
      }
    }
  }
`;
