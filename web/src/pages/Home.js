import React, { useContext } from "react";
import { useQuery } from "@apollo/client";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import CircularProgress from "@mui/material/CircularProgress";
import { AuthContext } from "../context/auth";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import { FETCH_POSTS_QUERY } from "../util/FetchAllPostsQuery";

function Home() {
  const { user } = useContext(AuthContext);
  const { loading, data } = useQuery(FETCH_POSTS_QUERY);
  const posts = data?.getPosts;
  console.log(posts);
  console.log("Home component rendered");

  if (data) {
    console.log(data);
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        {user && (
          <Grid item xs={12} sx={{ pb: 1, mb: 3 }}>
            <PostForm />
          </Grid>
        )}

        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom className="home-page-header">
            Recent Posts
          </Typography>
        </Grid>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}>
            <CircularProgress size={50} color="secondary" />
          </div>
        ) : (
          posts &&
          posts.map((post) => (
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              key={post.id}
              sx={{ pb: 1, mb: 3 }}>
              <PostCard post={post} user={user} />
            </Grid>
          ))
        )}
      </Grid>
    </Grid>
  );
}

export default Home;
