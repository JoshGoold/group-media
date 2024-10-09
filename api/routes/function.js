const User = require("../schemas/UserSchema");

const quickSort = require("../js/quickSort");
const multer = require("multer");
const path = require("path");
const imageResizer = require('../js/imageResize')
const getBase64 = require("../js/getBase64")

const auth = require('../middleware/auth')

const fs = require('fs')

const express = require("express")

const functionRoutes = express.Router()



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
  functionRoutes.get("/follow", async (req, res) => {
    const { username } = req.query;
    if (req.session.userObject) {
      try {
        const user = await User.findOne({ username: username });
        const you = await User.findOne({
          username: req.session.userObject.username,
        });
  
        if (!user) {
          res.status(300).send("No users found.");
        }
  
        const existingFollower = user.followers.find(
          (follower) =>
            follower.id.equals(req.session.userObject.id) ||
            follower.username === req.session.userObject.username
        );
  
        if (existingFollower) {
          res.send("You cannot follow someone twice");
          return;
        }
  
        user.followers.push({ id: you._id, username: you.username });
        you.following.push({ id: user._id, username: user.username });
  
        await user.save();
        await you.save();
  
        res.status(200).send({
          Message: `You are now following ${user.username}`,
          Success: true,
        });
      } catch (error) {
        res.status(400).send("error occurred: ", error.message);
      }
    } else {
      res.status(401).send("You must be logged in to add a friend");
    }
  });
  
  functionRoutes.get("/user-profile", async (req, res) => {
    const { username } = req.query;
  
    try {
      if (req.session.userObject) {
        const user = await User.findOne({ username: username }).select(
          "username followers following id email profilepic letters posts"
        );

        const filepath = user.profilepic;
        const base64Image = await getBase64(filepath);

        // Use Promise.all to handle asynchronous post image conversions
        const posts = await Promise.all(user.posts.map(async (post) => {
          const filePath = post.postImg;
          const base64PostImage = await getBase64(filePath);
          return {
              img: `data:image/webp;base64,${base64PostImage}`,
              ...post._doc,
          };
      }));
  
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
            profilepic: `data:image/webp;base64,${base64Image}` ,
            letters: user.letters,
            posts: posts,
          },
          Success: true,
        });
        console.log("user found: ", user.username);
      } else {
        res.status(401).send("You must be logged in to view an account");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send(`Internal server error --> ${error}`);
    }
  });
  
  functionRoutes.post("/delete-letter", async (req, res) => {
    const { id } = req.body;
  
    try {
      if (req.session.userObject) {
        const user = await User.findOne({
          username: req.session.userObject.username,
        });
  
        const letter = user.letters.find((letter) => letter._id.equals(id));
  
        if (!letter) {
          res.status(404).send({ Message: "no letters found", Success: false });
        }
  
        await letter.deleteOne();
  
        await user.save();
  
        res.send({ Message: "letter deleted successfully", Success: true });
      } else {
        res.status(400).send({ Message: "Unauthorized", Success: false });
      }
    } catch (error) {
      console.error(error);
      res.send(error.message);
    }
  });
  
  functionRoutes.post("/delete-post", async (req, res) => {
    const { id } = req.body;
  
    try {
      if (req.session.userObject) {
        const user = await User.findOne({
          username: req.session.userObject.username,
        });
  
        const post = user.posts.find((post) => post._id.equals(id));
  
        if (!letter) {
          res.status(404).send({ Message: "no posts found", Success: false });
        }
  
        await post.deleteOne();
  
        await user.save();
  
        res.send({ Message: "post deleted successfully", Success: true });
      } else {
        res.status(400).send({ Message: "Unauthorized", Success: false });
      }
    } catch (error) {
      console.error(error);
      res.send(error.message);
    }
  });
  
  functionRoutes.post("/edit-letter", async (req, res) => {
    const { id, content, title } = req.body;
    try {
      if (!req.session.userObject) {
        return res.status(400).send({ Message: "Unauthorized", Success: false });
      }
      const user = await User.findOne({
        username: req.session.userObject.username,
      });
  
      if (!user) {
        return res
          .status(404)
          .send({ Message: "No users found", Success: false });
      }
  
      const letter = user.letters.find((letter) => letter._id.equals(id));
  
      if (!letter) {
        return res
          .status(404)
          .send({ Message: "No letters found", Success: false });
      }
  
      letter.letterContent = content;
      letter.letterHead = title;
  
      await user.save();
  
      res.send({ Message: "Edit success", Success: true });
    } catch (error) {
      console.error(error);
      res.status(500).send({ Message: error.message, Success: false });
    }
  });
  
  functionRoutes.post("/new-letter", async (req, res) => {
    const { title, contents } = req.body;
  
    if (req.session.userObject) {
      try {
        const user = await User.findOne({
          username: req.session.userObject.username,
        }).select("letters");
  
        if (!user) {
          return res.status(404).send("No user found");
        }
  
        user.letters.push({ letterContent: contents, letterHead: title });
        await user.save();
  
        return res
          .status(200)
          .send({ Message: "Uploaded successfully", Success: true });
      } catch (error) {
        console.error(error);
        return res.status(500).send(`Internal server error: ${error.message}`);
      }
    } else {
      return res.status(401).send("You must be logged in to post a letter");
    }
  });
  
  functionRoutes.post("/like-letter", async (req, res) => {
    const { letterId, profileUsername } = req.body;
  
    if (req.session.userObject) {
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
          (like) => like.likerUsername === req.session.userObject.username
        );
        if (alreadyLiked) {
          res.status(400).send("You have already liked this letter");
          return;
        }
  
        letter.likes.push({
          likerId: req.session.userObject.id,
          likerUsername: req.session.userObject.username,
        });
        await user.save();
  
        return res
          .status(200)
          .send({ Message: "Liked letter successfully", Success: true });
      } catch (error) {
        console.error(error);
        return res.status(500).send(`Error: ${error.message}`);
      }
    } else {
      return res.status(401).send("You must be logged in to like a letter");
    }
  });
  functionRoutes.post("/comment-letter", async (req, res) => {
    const { letterId, comment, profileUsername } = req.body;
  
    if (req.session.userObject) {
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
          commenterId: req.session.userObject.id,
          commenterUsername: req.session.userObject.username,
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
    } else {
      return res.status(401).send("You must be logged in to comment on a letter");
    }
  });
  

  
  const ppUpload = multer({ storage: multer.memoryStorage() });
  
  functionRoutes.post("/new-profilepicture", ppUpload.single("img"), async (req, res) => {

    const img = req.file.buffer
  
    if (!req.session.userObject) {
      return res.status(401).send("Unauthorized");
    }

    const resizedImg = await imageResizer(img);

        const outputPath = path.join(__dirname, '../profilepictures/', `resized-image-${Date.now()}.webp`);
        fs.writeFileSync(outputPath, resizedImg);
  
    try {
      const user = await User.findOne({
        username: req.session.userObject.username,
      });
  
      if (!user) {
        return res.status(404).send("No user found");
      }
  
      // Update profile picture
      user.profilepic = outputPath;
  
      // Save the updated user
      await user.save();
  
      // Send success response
      return res
        .status(200)
        .send({ Message: "Profile picture updated successfully", Success: true });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send({ Message: "Internal server error", Success: false });
    }
  });
  
 
  const upload = multer({ storage: multer.memoryStorage() });
  
  functionRoutes.post("/new-post", upload.single("img"), async (req, res) => {
    const { description } = req.body;
    const img = req.file.buffer
  
    if (req.session.userObject) {
      try {
        const user = await User.findOne({
          username: req.session.userObject.username,
        }).select("posts");

        const resizedImg = await imageResizer(img);

        const outputPath = path.join(__dirname, '../uploads/', `resized-image-${Date.now()}.webp`);
        fs.writeFileSync(outputPath, resizedImg);
  
        if (!user) {
          return res.status(404).send("No user found");
        }
  
        // Push the post with the image URL to the user's posts
        user.posts.push({ postImg: outputPath, postContent: description });
        await user.save();
  
        return res.status(200).send("Successfully uploaded post");
      } catch (error) {
        console.error(error);
        return res.status(500).send(`Error occurred: ${error.message}`);
      }
    } else {
      return res.status(401).send("You must be logged in to add a new post");
    }
  });
  
  functionRoutes.post("/like-post", async (req, res) => {
    const { postId, profileUsername } = req.body;
  
    if (req.session.userObject) {
      try {
        const user = await User.findOne({ username: profileUsername });
        if (!user) {
          return res.status(404).send("User not found");
        }
  
        const post = user.posts.find((post) => post._id === postId);
        if (!post) {
          return res.status(404).send("Post not found");
        }
  
        // Prevent duplicate likes
        const alreadyLiked = post.likes.find(
          (like) => like.likerUsername === req.session.userObject.username
        );
        if (alreadyLiked) {
          res.status(400).send("You have already liked this post");
          return;
        }
  
        post.likes.push({
          likerId: req.session.userObject.id,
          likerUsername: req.session.userObject.username,
        });
        await user.save();
  
        return res
          .status(200)
          .send({ Message: "Liked post successfully", Success: true });
      } catch (error) {
        console.error(error);
        return res.status(500).send(`Error: ${error.message}`);
      }
    } else {
      return res.status(401).send("You must be logged in to like a post");
    }
  });
  
  functionRoutes.post("/comment-post", async (req, res) => {
    const { postId, comment, profileUsername } = req.body;
  
    if (req.session.userObject) {
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
          commenterId: req.session.userObject.id,
          commenterUsername: req.session.userObject.username,
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
    } else {
      return res.status(401).send("You must be logged in to comment on a post");
    }
  });
  
  functionRoutes.get("/home-feed", async (req, res) => {
    if (!req.session.userObject) {
        return res.status(400).send("You must be logged in");
    }

    try {
        const user = await User.findOne({
            username: req.session.userObject.username,
        });

        if (!user) return res.status(404).send("No users found");

        const allPosts = []; // Changed variable name to avoid confusion

        // Fetch all users that the current user is following
        const followees = await User.find({ username: { $in: user.following.map(f => f.username) } })
            .populate("posts letters");

        for (const u of followees) {
            // Process posts
            if (u.posts && u.posts.length > 0) {
                const userPosts = await Promise.all(
                    u.posts.map(async (post) => {
                        const filePath = post.postImg;
                        const base64PostImage = await getBase64(filePath);
                        return {
                            ...post.toObject(),
                            username: u.username,
                            img: `data:image/webp;base64,${base64PostImage}`,
                        };
                    })
                );
                allPosts.push(...userPosts); // Accumulate posts
            }

            // Process letters
            if (u.letters && u.letters.length > 0) {
                u.letters.forEach((letter) =>
                    allPosts.push({ ...letter.toObject(), username: u.username })
                );
            }
        }

        const sortedPosts = quickSort(allPosts); // Sort all accumulated posts

        res.status(200).send({ Success: true, feed: sortedPosts });
    } catch (error) {
        res.status(500).send(`Internal Server Error --> ${error.message}`);
    }
});

functionRoutes.get("/recomendation", auth, async (req,res)=>{
  try {
    const following = req.user.following;
    var followersOfFollowee = [];
    var recomendedPosts = [];

    console.log(req.user)
    
    await Promise.all(
    following.map(async(followee)=>{
      const user = await User.findOne({username: followee.username}).select("followers following username _id")

      if(!user) return res.status(404).send({Message: "No user found", Success: false})

      console.log(user)
      followersOfFollowee = followersOfFollowee.concat(user.followers, user.following)
    })
    )
    console.log("following array",followersOfFollowee)

  await Promise.all(
    followersOfFollowee.map(async(followerOfFollowee)=>{
      console.log(followerOfFollowee)
      const user = await User.findOne({username: followerOfFollowee.username}).select("followers following username _id posts letters email")

      if(!user) return res.status(404).send({Message: "No user found", Success: false})
        const isFollowed = req.user.following.find((followee) => followee.username === user.username);
      if (isFollowed) {
        console.log(`Skipping user ${user.username} because they are already followed by ${req.user.username}`);
        return;
      }
      if(req.user.username === user.username) return;

      
        if (user.posts && user.posts.length > 0) {
          
            const userPosts = await Promise.all(
              user.posts.map(async (post) => {
                  const filePath = post.postImg;
                  const base64PostImage = await getBase64(filePath);
                  return {
                      ...post.toObject(),
                      username: user.username,
                      img: `data:image/webp;base64,${base64PostImage}`,
                  };
              })

          );
            recomendedPosts.push({ posts: userPosts })
          }
           
        if (user.letters && user.letters.length > 0) {
        user.letters.forEach((letter) =>
            recomendedPosts.push({ ...letter.toObject(), username: user.username })
          );
        } 
    })
  )

    res.status(200).send({recomended: recomendedPosts, Success: true})

  } catch (error) {
    res.status(500).send({Message: `Server Error --> ${error.message}`})
    console.log(`Server error occurred --> ${error}`)
  }
})

  module.exports = functionRoutes;