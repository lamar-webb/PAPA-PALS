import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthenticationError } from "apollo-server";
dotenv.config();

/**
 * Checks and verifies the authentication token from the request headers.
 *
 * @param {Object} context - The GraphQL context object that holds contextual information for each request.
 * @returns {Object} The decoded user object from the token if the authentication is successful.
 * @throws {Error} If the authorization header is not provided, or the token format is incorrect.
 * @throws {AuthenticationError} If the token is invalid or expired.
 */
function authCheckFunction(context) {
  // Extract the authorization header from the request (context.req.headers)
  const authHeader = context.req.headers.authorization;

  // Check if the authorization header exists
  if (authHeader) {
    // The expected format of the header is "Bearer [token]"
    // Split the header to get the token part
    const token = authHeader.split("Bearer ")[1];

    // Check if the token exists after the split
    if (token) {
      try {
        // Verify the token with the secret key and decode it
        const user = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user object to the context for use in other resolvers
        context.user = user;

        // Return the decoded user object
        return user;
      } catch (err) {
        // If token verification fails, throw an authentication error
        throw new AuthenticationError("Invalid/Expired token");
      }
    }
    // If the token format is incorrect, throw an error
    throw new Error("Authentication token must be 'Bearer [token]'");
  }
  // If the authorization header is missing, throw an error
  throw new Error("Authorization header must be provided");
}

export default authCheckFunction;
