import dotenv from "dotenv";
import { queryDB } from "../database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserInputError } from "apollo-server";
import validateRegisterInput from "../util/registrationValidation.js";
import validateLoginInput from "../util/loginValidation.js";
import authCheckFunction from "../util/checkAuthorization.js";
import { AuthenticationError } from "apollo-server";
dotenv.config();

/**
 *  Generates a token for a user using the jsonwebtoken library
 * @param {*} user
 * @returns  token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

/*
What is a resolver? 
A resolver is a function that returns data for a field in a schema. 
Every resolver function in a GraphQL schema accepts four positional arguments: parent, args, context, and info.
The first argument, parent, is the result of the previous resolver execution level, or the root if there are no previous resolvers. 
The second argument, args, contains all GraphQL arguments provided for this field. The third argument, context, is an object shared by all resolvers in a GraphQL operation. 
We use the context to share per-operation state, including authentication information and access to data sources. 
The fourth argument, info, carries information about the execution state of the query, including the field name, path to the field from the root, and more.   
*/

const resolvers = {
  Query: {
    //get all posts resolver

    async getPosts() {
      try {
        const posts = await queryDB(
          `
          SELECT p.id, p.body, p.created_at, u.username         
          FROM posts p
          JOIN users u ON p.user_id = u.id
          ORDER BY p.created_at DESC LIMIT 2;`, // Limit to 2 posts because of databse limits of the free tier
          []
        );
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },

    //get single post resolver
    async getPost(_, { postId }) {
      try {
        const post = await queryDB(
          `
          SELECT p.id, p.body, p.created_at, u.username
          FROM posts p
          JOIN users u ON p.user_id = u.id
          WHERE p.id = $1
          `,
          [postId]
        );

        //check if post exists
        if (post.length < 1) {
          throw new Error("Post not found");
        }

        return post[0];
      } catch (err) {
        throw new Error("Error fetching post: " + err.message);
      }
    },

    //get comments resolver
    async getComments(_, { postId }) {
      try {
        const comments = await queryDB(
          "SELECT * FROM comments WHERE post_id = $1;",
          [postId]
        );
        return comments;
      } catch (err) {
        throw new Error("Error fetching comments: " + err.message);
      }
    },
  },

  Post: {
    comments: async (parent) => {
      // parent is the post object
      const comments = await queryDB(
        "SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC LIMIT 2;", // Limit to 2 comments because of databse limits of the free tier
        [parent.id]
      );
      return comments;
    },
    likes: async (parent) => {
      const likes = await queryDB(
        "SELECT * FROM likes WHERE post_id = $1 LIMIT 2;",
        [
          // Limit to 2 likes because of databse limits of the free tier
          parent.id,
        ]
      );
      return likes;
    },
  },

  Comment: {
    user: async (parent) => {
      const [user] = await queryDB("SELECT * FROM users WHERE id = $1;", [
        parent.user_id,
      ]);
      if (!user) {
        throw new Error(`User not found for user_id: ${parent.user_id}`);
      }
      return user;
    },
    post: async (parent) => {
      const [post] = await queryDB(
        `
      SELECT p.id, p.body, p.created_at, u.username
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1;`,
        [parent.post_id]
      );
      if (!post) {
        throw new Error(`Post not found for post_id: ${parent.post_id}`);
      }
      return post;
    },
  },

  Like: {
    user: async (parent) => {
      const [user] = await queryDB("SELECT * FROM users WHERE id = $1;", [
        parent.user_id,
      ]);
      if (!user) {
        throw new Error(`User not found for user_id: ${parent.user_id}`);
      }
      return user;
    },
    post: async (parent) => {
      console.log("Parent in Comment resolver:", parent);

      const [post] = await queryDB("SELECT * FROM posts WHERE id = $1;", [
        parent.post_id,
      ]);
      if (!post) {
        throw new Error(`Post not found for post_id: ${parent.post_id}`);
      }
      return post;
    },
  },

  Mutation: {
    //login resolver
    async login(_, { username, password }) {
      try {
        const { errors, valid } = validateLoginInput(username, password);

        if (!valid) {
          throw new UserInputError("Validation error detected", { errors });
        }

        //selects user from database
        const user = await queryDB("SELECT * FROM users WHERE username = $1;", [
          username,
        ]);

        //check if user exists
        if (user.length < 1) {
          errors.notFound = "User not found";
          throw new UserInputError("User not found", { errors });
        }

        //check if password is correct
        const match = await bcrypt.compare(password, user[0].password);

        if (!match) {
          errors.wrongCredentials = "Wrong credentials";
          throw new UserInputError("Wrong credentials", { errors });
        }

        const token = generateToken(user[0]);

        if (!token) {
          throw new Error("Token could not be created");
        }

        return { ...user[0], token };
      } catch (err) {
        if (err instanceof UserInputError) {
          throw err; // Propagate the UserInputError without modification
        }
        // Handle other errors
        throw new Error("An error occurred");
      }
    },

    //register resolver
    async register(
      _,
      { registerInput: { username, email, password, confirm_password } }
    ) {
      try {
        //chech if user already exists
        const user = await queryDB("SELECT * FROM users WHERE username = $1;", [
          username,
        ]);

        if (user.length > 0) {
          throw new UserInputError("Username is taken", {
            //this is the error message that will be displayed in the frontend
            errors: {
              username: "This username is taken",
            },
          });
        }

        //validate user data
        const { errors, valid } = validateRegisterInput(
          username,
          email,
          password,
          confirm_password
        );

        console.log(errors);

        if (!valid) {
          throw new UserInputError("Validation error detected", { errors });
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        password = hashedPassword;

        //Insert user into database and returns user data and token
        const newUser = await queryDB(
          "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *;",
          [username, email, password]
        );

        //create token
        const token = generateToken(newUser[0]);

        if (!token) {
          throw new Error("Token could not be created");
        }

        return { ...newUser[0], token };
      } catch (err) {
        if (err instanceof UserInputError) {
          throw err; // Propagate the UserInputError without modification
        }
        // Handle other errors
        throw new Error("An error occurred");
      }
    },

    //create post resolver
    async createPost(_, { body }, context) {
      const user = authCheckFunction(context);

      if (body.trim() === "") {
        throw new Error("Post body must not be empty");
      }

      const insertPostSQL = `
        INSERT INTO posts (body, user_id)
        VALUES ($1, $2)
        RETURNING *; 
      `;

      try {
        // Execute the INSERT operation
        const insertPostResult = await queryDB(insertPostSQL, [body, user.id]);

        // Check if the post was successfully created
        if (!insertPostResult) {
          throw new Error("Failed to create post.");
        }

        const newPost = insertPostResult[0];

        //query database to get the username of the user that created the post
        const [userResult] = await queryDB(
          "SELECT * FROM users WHERE id = $1;",
          [user.id]
        );

        //query database to get the likes of the post
        const likes = await queryDB("SELECT * FROM likes WHERE post_id = $1;", [
          newPost.id,
        ]);

        //query database to get the comments of the post
        const comments = await queryDB(
          "SELECT * FROM comments WHERE post_id = $1;",
          [newPost.id]
        );

        // Add the username to the post object
        newPost.username = userResult.username;

        // Add the likes to the post object
        newPost.likes = likes;

        // Add the comments to the post object
        newPost.comments = comments;

        // Return the new post data
        return newPost;
      } catch (error) {
        console.error("Error creating post:", error);
        throw new Error("Error creating post.");
      }
    },

    //delete post resolver
    async deletePost(_, { postId }, context) {
      //check if user is authenticated
      const user = authCheckFunction(context);
      console.log(user, "authenticated user ");

      try {
        //select post from database
        const post = await queryDB("SELECT * FROM posts WHERE id = $1;", [
          postId,
        ]);

        //check if post exists
        if (post.length < 1) {
          throw new Error("Post not found");
        }

        //check if post belongs to authenticated user
        if (post[0].user_id !== context.user.id) {
          throw new AuthenticationError(
            "Action not allowed, you can only delete your own posts"
          );
        }

        //delete post from database
        await queryDB("DELETE FROM posts WHERE id = $1;", [postId]);

        return "Post deleted successfully";
      } catch (err) {
        throw new Error(err);
      }
    },
    //create comment resolver
    async createComment(_, { postId, body }, context) {
      // Authentication check
      const user = authCheckFunction(context);
      if (!user)
        throw new AuthenticationError("You must be logged in to comment.");

      // Comment body check
      if (body.trim() === "") {
        throw new UserInputError("Empty comment", {
          errors: { body: "Comment body cannot be empty" },
        });
      }

      // Insert comment into database
      const [newComment] = await queryDB(
        "INSERT INTO comments (body, user_id, post_id) VALUES ($1, $2, $3) RETURNING *;",
        [body, user.id, postId]
      );

      // Return the new comment
      return {
        id: newComment.id,
        body: newComment.body,
        created_at: newComment.created_at,
        user_id: newComment.user_id,

        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        post: {
          id: postId,
          body: newComment.body,
        },
      };
    },
    //delete comment resolver
    async deleteComment(_, { postId, commentId }, context) {
      // Authentication check
      const user = authCheckFunction(context);
      if (!user)
        throw new AuthenticationError(
          "You must be logged in to delete a comment."
        );

      // Check if comment exists
      const [comment] = await queryDB(
        "SELECT * FROM comments WHERE id = $1 AND post_id = $2;",
        [commentId, postId]
      );
      if (!comment) throw new UserInputError("Comment not found");

      // Check if comment belongs to authenticated user
      if (comment.user_id !== user.id) {
        throw new AuthenticationError(
          "Action not allowed, you can only delete your own comments"
        );
      }

      // Delete comment from database
      await queryDB("DELETE FROM comments WHERE id = $1;", [commentId]);

      // Return the post
      return {
        id: postId,
      };
    },
    //like post resolver
    async likePost(_, { postId }, context) {
      // Authentication check
      const user = authCheckFunction(context);
      if (!user)
        throw new AuthenticationError("You must be logged in to like a post.");

      // Check if post exists
      const post = await queryDB("SELECT * FROM posts WHERE id = $1;", [
        postId,
      ]);
      if (!post) throw new UserInputError("Post not found");

      // Check if the like already exists
      const like = await queryDB(
        "SELECT * FROM likes WHERE username = $1 AND post_id = $2;",
        [user.username, postId]
      );

      if (like.length > 0) {
        // Like already exists, remove it (unlike)
        await queryDB(
          "DELETE FROM likes WHERE username = $1 AND post_id = $2;",
          [user.username, postId]
        );
      } else {
        // Like does not exist, add it
        await queryDB(
          "INSERT INTO likes (username, post_id, user_id) VALUES ($1, $2, $3);",
          [user.username, postId, user.id]
        );
      }

      // Fetch the updated post with likes and return it
      const [updatedPost] = await queryDB(
        "SELECT p.id, p.body, p.created_at, ARRAY_AGG(l.id) AS likes FROM posts p LEFT JOIN likes l ON p.id = l.post_id WHERE p.id = $1 GROUP BY p.id;",
        [postId]
      );

      if (!updatedPost) {
        throw new Error("Post not found after like/unlike operation");
      }

      // Format the likes to include user data
      updatedPost.likes = updatedPost.likes.map(async (likeId) => {
        // Fetch user data for each like
        const [likeUser] = await queryDB(
          "SELECT username FROM users WHERE id = (SELECT user_id FROM likes WHERE id = $1);",
          [likeId]
        );
        return { id: likeId, user: likeUser };
      });

      return updatedPost;
    },
  },
};

export default resolvers;
