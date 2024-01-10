const typeDefs = `#graphql
  type Post {
    id: ID!
    body: String!
    created_at: String!
    username: String! 
    comments: [Comment]!
    likes: [Like]!
  }

  type Comment {
    id: ID!
    body: String!
    created_at: String!
    user: User!
    post: Post!
  }

  type Like {
    id: ID!
    created_at: String!
    user: User!
    post: Post!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    confirm_password: String!
  }

    type User {
    id: ID!
    username: String!
    email: String!
    created_at: String!
    token: String!
    }

  type Query {
    getPosts: [Post!]!
    getPost(postId: ID!): Post!
    getComments(postId: ID!): [Comment]!
    
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    createPost(body: String!): Post!
    deletePost(postId:ID!):String!
    createComment(postId:String!, body: String!):Comment!
    deleteComment(postId: ID!, commentId:ID!):Post!
    likePost(postId: ID!):Post!
  }

`;

export default typeDefs;
