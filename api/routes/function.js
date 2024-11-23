const User = require("../schemas/UserSchema");
const { put } = require("@vercel/blob");
const quickSort = require("../js/quickSort");
const multer = require("multer");
const path = require("path");
const imageResizer = require("../js/imageResize");
const getBase64 = require("../js/getBase64");

const auth = require("../middleware/auth");
const mongoose = require("mongoose")
const fs = require("fs");

const express = require("express");

const functionRoutes = express.Router();

//user search endpoint
//finds users based off search query regex
functionRoutes.get("/user-search", async (req, res) => {
  const searchQuery = req.query.searchQuery;
  try {
    // Case-sensitive search /RegExp(...,'i') to make insensitive/
    //
    const contains = new RegExp(searchQuery);
    const result = await User.find({ username: { $regex: contains } })
      .limit(25)
      .skip(0)
      .select("username _id");
    res.status(200).send({ Message: "Success", list: result });
  } catch (error) {
    console.error(error.message);
    res.status(400).send({ Message: "Search Failed" });
  }
});

//follow endpoint
functionRoutes.get("/follow", auth, async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      res.status(300).send("No users found.");
    }

    const existingFollower = user.followers.find(
      (follower) =>
        follower.id.equals(req.user._id) ||
        follower.username === req.user.username
    );

    if (existingFollower) {
      res.send("You cannot follow someone twice");
      return;
    }

    user.followers.push({ id: req.user._id, username: req.user.username });
    req.user.following.push({ id: user._id, username: user.username });

    await user.save();
    await req.user.save();

    res.status(200).send({
      Message: `You are now following ${user.username}`,
      Success: true,
    });
  } catch (error) {
    res.status(400).send(`Error occured: ${error.message}`);
  }
});

functionRoutes.get("/user-profile", auth, async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username: username }).select(
      "username followers following id email profilepic letters posts"
    );

    // Use Promise.all to handle asynchronous post image conversions
    const posts = await Promise.all(
      user.posts.map(async (post) => {
        const filePath = post.postImg;
        return {
          img: filePath,
          ...post._doc,
        };
      })
    );

    if (!user) {
      res.status(404).send("No users found");
    }
    res.status(200).send({
      user: {
        username: user.username,
        email: user.email,
        _id: user._id,
        followers: user.followers,
        following: user.following,
        profilepic: user.profilepic,
        letters: user.letters,
        posts: posts,
      },
      Success: true,
    });
    console.log("user found: ", user.username);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Internal server error --> ${error}`);
  }
});

functionRoutes.post("/delete-letter", auth, async (req, res) => {
  const { id } = req.body;

  try {
    const letter = req.user.letters.find((letter) => letter._id.equals(id));

    if (!letter) {
      res.status(404).send({ Message: "no letters found", Success: false });
    }

    await letter.deleteOne();

    await req.user.save();

    res.send({ Message: "letter deleted successfully", Success: true });
  } catch (error) {
    console.error(error);
    res.send(error.message);
  }
});

functionRoutes.post("/delete-post", auth, async (req, res) => {
  const { id } = req.body;

  try {
    const post = req.user.posts.find((post) => post._id.equals(id));

    if (!letter) {
      res.status(404).send({ Message: "no posts found", Success: false });
    }

    await post.deleteOne();

    await user.save();

    res.send({ Message: "post deleted successfully", Success: true });
  } catch (error) {
    console.error(error);
    res.send(error.message);
  }
});

functionRoutes.post("/edit-letter", auth, async (req, res) => {
  const { id, content, title } = req.body;
  try {
    if (!req.user) {
      return res
        .status(404)
        .send({ Message: "No users found", Success: false });
    }

    const letter = req.user.letters.find((letter) => letter._id.equals(id));

    if (!letter) {
      return res
        .status(404)
        .send({ Message: "No letters found", Success: false });
    }

    letter.letterContent = content;
    letter.letterHead = title;

    await req.user.save();

    res.send({ Message: "Edit success", Success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ Message: error.message, Success: false });
  }
});

functionRoutes.post("/new-letter", auth, async (req, res) => {
  const { title, contents } = req.body;

  try {
    req.user.letters.push({ letterContent: contents, letterHead: title });
    await req.user.save();

    return res
      .status(200)
      .send({ Message: "Uploaded successfully", Success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});

functionRoutes.post("/like-letter", auth, async (req, res) => {
  const { letterId, profileUsername } = req.body;

  try {
    const user = await User.findOne({ username: profileUsername });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const letter = user.letters.find((letter) => letter.id === letterId);
    if (!letter) {
      return res.status(404).send("Letter not found");
    }

    const alreadyLiked = letter.likes.find(
      (like) => like.likerUsername === req.user.username
    );
    if (alreadyLiked) {
      res.status(400).send("You have already liked this letter");
      return;
    }

    letter.likes.push({
      likerId: req.user._id,
      likerUsername: req.user.username,
    });
    await user.save();

    return res
      .status(200)
      .send({ Message: "Liked letter successfully", Success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});
functionRoutes.post("/comment-letter", auth, async (req, res) => {
  const { letterId, comment, profileUsername } = req.body;

  try {
    const user = await User.findOne({ username: profileUsername });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const letter = user.letters.find((letter) => letter.id === letterId);
    if (!letter) {
      return res.status(404).send("Letter not found");
    }

    letter.comments.push({
      commenterId: req.user._id,
      commenterUsername: req.user.username,
      comment: comment,
    });
    await user.save();

    return res
      .status(200)
      .send({ Message: "Commented successfully", Success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

const ppUpload = multer({ storage: multer.memoryStorage() });

functionRoutes.post(
  "/new-profilepicture",
  ppUpload.single("img"),
  auth,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).send("Image file is required");
    }

    // Use the file buffer from multer
    const blob = await put(`${Date.now()}-${req.file.originalname}`, req.file.buffer, {
      access: "public", // Makes the file publicly accessible
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    const imageUrl = blob.url;

 

    try {
      // Update profile picture
      req.user.profilepic = imageUrl;

      // Save the updated user
      await req.user.save();

      // Send success response
      return res
        .status(200)
        .send({
          Message: "Profile picture updated successfully",
          Success: true,
        });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ Message: "Internal server error", Success: false });
    }
  }
);



// Configure multer for memory storage (to avoid saving files to disk)
const upload = multer({ storage: multer.memoryStorage()});

functionRoutes.post(
  "/new-post",
  upload.single("img"), // This processes the "img" field from the form data
  auth,
  async (req, res) => {
    const { description } = req.body;

    try {
      if (!req.file) {
        return res.status(400).send("Image file is required");
      }

      // Use the file buffer from multer
      const blob = await put(`${Date.now()}-${req.file.originalname}`, req.file.buffer, {
        access: "public", // Makes the file publicly accessible
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      const imageUrl = blob.url;

      // Save the post with the image URL
      req.user.posts.push({ postImg: imageUrl, postContent: description });
      await req.user.save();

      return res.status(200).send({ message: "Successfully uploaded post", imageUrl });
    } catch (error) {
      console.error("Error uploading post:", error);
      return res.status(500).send(`Error occurred: ${error.message}`);
    }
  }
);

functionRoutes.post("/like-post", auth, async (req, res) => {
  const { postId, profileUsername } = req.body;

  try {
    const user = await User.findOne({ username: profileUsername });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const post = user.posts.find((post) => post.id === postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Prevent duplicate likes
    const alreadyLiked = post.likes.find(
      (like) => like.likerUsername === req.user.username
    );
    if (alreadyLiked) {
      res.status(400).send("You have already liked this post");
      return;
    }

    post.likes.push({
      likerId: req.user._id,
      likerUsername: req.user.username,
    });
    await user.save();

    return res
      .status(200)
      .send({ Message: "Liked post successfully", Success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

functionRoutes.post("/comment-post", auth, async (req, res) => {
  const { postId, comment, profileUsername } = req.body;

  try {
    const user = await User.findOne({ username: profileUsername });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const post = user.posts.find((post) => post._id === postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    post.comments.push({
      commenterId: req.user._id,
      commenterUsername: req.user.username,
      comment: comment,
    });

    await user.save();

    return res
      .status(200)
      .send({ Message: "Commented successfully", Success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

functionRoutes.get("/home-feed", auth, async (req, res) => {
  try {
    const allPosts = []; // Changed variable name to avoid confusion

    // Fetch all users that the current user is following
    const followees = await User.find({
      username: { $in: req.user.following.map((f) => f.username) },
    }).select("posts letters username _id");

    for (const u of followees) {
      // Process posts
      if (u.posts && u.posts.length > 0) {
        const userPosts = await Promise.all(
          u.posts.map(async (post) => {
            const filePath = post.postImg;
            return {
              ...post.toObject(),
              username: u.username,
              img: filePath,
              feed: true
            };
          })
        );
        allPosts.push(...userPosts); // Accumulate posts
      }

      // Process letters
      if (u.letters && u.letters.length > 0) {
        u.letters.forEach((letter) =>
          allPosts.push({ ...letter.toObject(), username: u.username, feed: true })
        );
      }
    }

    const sortedPosts = quickSort(allPosts); // Sort all accumulated posts

    res.status(200).send({ Success: true, feed: sortedPosts });
  } catch (error) {
    res.status(500).send(`Internal Server Error --> ${error.message}`);
  }
});

functionRoutes.get("/recomendation", auth, async (req, res) => {
  try {
    const following = req.user.following;
    var followersOfFollowee = [];
    var recomendedPosts = [];

    console.log(req.user);

    await Promise.all(
      following.map(async (followee) => {
        const user = await User.findOne({ username: followee.username }).select(
          "followers following username _id"
        );

        if (!user)
          return res
            .status(404)
            .send({ Message: "No user found", Success: false });

        console.log(user);
        followersOfFollowee = followersOfFollowee.concat(
          user.followers,
          user.following
        );
      })
    );
    console.log("following array", followersOfFollowee);

    await Promise.all(
      followersOfFollowee.map(async (followerOfFollowee) => {
        console.log(followerOfFollowee);
        const user = await User.findOne({
          username: followerOfFollowee.username,
        }).select("followers following username _id posts letters email");

        if (!user)
          return res
            .status(404)
            .send({ Message: "No user found", Success: false });
        const isFollowed = req.user.following.find(
          (followee) => followee.username === user.username
        );
        if (isFollowed) {
          console.log(
            `Skipping user ${user.username} because they are already followed by ${req.user.username}`
          );
          return;
        }
        if (req.user.username === user.username) return;

        if (user.posts && user.posts.length > 0) {
          const userPosts = await Promise.all(
            user.posts.map(async (post) => {
              const filePath = post.postImg;
              return {
                ...post.toObject(),
                username: user.username,
                img: filePath,
                reccomended: true,
              };
            })
          );
          recomendedPosts.push({ posts: userPosts });
        }

        if (user.letters && user.letters.length > 0) {
          user.letters.forEach((letter) =>
            recomendedPosts.push({
              ...letter.toObject(),
              username: user.username,
              reccomended: true,
            })
          );
        }
      })
    );

    res.status(200).send({ recomended: recomendedPosts, Success: true });
  } catch (error) {
    res.status(500).send({ Message: `Server Error --> ${error.message}` });
    console.log(`Server error occurred --> ${error}`);
  }
});

module.exports = functionRoutes;
