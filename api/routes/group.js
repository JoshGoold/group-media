const Group = require("../schemas/GroupSchema");
const User = require("../schemas/UserSchema");
const Message = require("../schemas/MessageSchema");
const Conversation = require("../schemas/ConversationSchema");

const multer = require("multer");

const fs = require('fs');
const path = require("path");
const imageResizer = require("../js/imageResize")
const getBase64 = require("../js/getBase64")

const express = require("express")

const groupRoutes = express.Router()

groupRoutes.post("/create-group", async (req, res) => {
    const { group_name, group_description, memberCount, category, access } = req.body;
    if (req.session.userObject) {
      try {
        const newGroup = new Group({
          groupName: group_name,
          groupDescription: group_description,
          memberCount: memberCount,
          groupCategory: category,
          groupAccess: access,
          participants: [
            {
              participant_id: req.session.userObject.id,
              participant_name: req.session.userObject.username,
              participant_profilePic: req.session.userObject.profilePic,
            },
          ],
          owner: {
            id: req.session.userObject.id,
            owner_name: req.session.userObject.username
          },
        });
  
        await newGroup.save()
        res.send({Message: `Group "${group_name}" created successfully`, Success: true})
      } catch (error) {
        console.error(error)
        res.status(500).send({Message: `"Server Error ---> " ${error}`, Success: false})
      }
    } else{
      res.status(404).send({Message: "You must be logged in to create a group", Success: false})
    }
  });
  
  groupRoutes.get("/groups", async (req,res)=>{
     const {category} = req.query;
     if(req.session.userObject){
      try {
        const groups = await Group.find({ groupCategory: category }); 
        if (!groups || groups.length === 0) { 
          return res.status(404).send({ Message: "No groups found", Success: false });
        }
        const arr = await Promise.all(groups.map(async (group) => {
          const filepath = group.groupProfilePicture;
          const base64Image = await getBase64(filepath);
          return {
              profilepic: `data:image/webp;base64,${base64Image}`,
              ...group._doc,
          };
      }));
        
      res.status(200).send({groups: arr, Success: true})
      } catch (error) {
        res.status(500).send({Message: `Server Error --> ${error.message}`, Success: false })
        console.error(`Server error ---> ${error}`)
      }
     
     } else{
      res.status(404).send({Message: "You must be logged in", Success: false})
     }
  })
  
  groupRoutes.post("/join-group", async (req,res)=>{
    const { groupid } = req.body;
    if(req.session.userObject){
      try {
        const group = await Group.findById(groupid)
  
      if(!group){
        return res.status(404).send({Message: "No group found", Success: false})
      }
      group.participants.push({participant_id: req.session.userObject.objID, participant_name: req.session.userObject.username, participant_profilePic: req.session.userObject.profilePic})
  
      await group.save()
  
      res.status(200).send({Message: `You have successfully joined ${group.groupName}! Welcome!!`, Success: true})
      } catch (error) {
        console.error(`Server Error --> ${error}`)
        res.status(500).send({Message: `Server Error --> ${error.message}`, Success: false})
      }
      
    } else{
      res.status(404).send({Message: "You must be logged in", Success: false})
    }
  
  })
  
  groupRoutes.post("/request-group", async (req,res)=>{
    const {groupid} = req.body;
    if(req.session.userObject){
      try {
        const group = await Group.findById(groupid)
        if(!group){
          return res.status(404).send({Message: "No groups found", Success: false})
        }
        const isRequested = group.requested_participants.find(par => par.id === req.session.userObject.id)
  
        if(isRequested){
          return res.status(400).send({Message: "Cannot request twice", Success: false})
        }
  
        group.requested_participants.push({participant_id: req.session.userObject.id, participant_name: req.session.userObject.username, participant_profilePic: req.session.userObject.profilePic})
  
        await group.save()
        res.status(200).send({Message: "Request sent", Success: true})
      } catch (error) {
        console.error(`Server error --> ${error}`)
        res.status(500).send({Message: `Server error --> ${error.messsage}`, Success: false})
      }
    } else{
      res.status(404).send({Message: "You must be logged in", Success: false})
    }
  
  })
  
  groupRoutes.get("/your-groups", async (req,res)=>{
    if(req.session.userObject){
     try {
       const groups = await Group.find({ 'participants.participant_id': req.session.userObject.objID }); 
       if (!groups || groups.length === 0) { 
         return res.status(404).send({ Message: "No groups found", Success: false });
       }
       const arr = await Promise.all(groups.map(async (group) => {
        const filepath = group.groupProfilePicture;
        const base64Image = await getBase64(filepath);
        return {
            profilepic: `data:image/webp;base64,${base64Image}`,
            ...group._doc,
        };
    }));
       
     res.status(200).send({groups: arr, Success: true})
     } catch (error) {
       res.status(500).send({Message: `Server Error --> ${error.message}`, Success: false })
       console.error(`Server error ---> ${error}`)
     }
    
    } else{
     res.status(404).send({Message: "You must be logged in", Success: false})
    }
  })
  //send message to pre existing conversation endpoint
  groupRoutes.post("/group-message", async (req, res) => {
    // you need a message, conversation id, and a recipent
    const { message, groupid } = req.body;
  
    //makes sure your logged in before sending the message
    if (req.session.userObject) {
      try {
        //creates new message entry to database and saves it
        const newMessage = new Message({
          content: message,
          sender: req.session.userObject.id,
        });
  
        await newMessage.save();
  
        //finds conversation by id given to add the message to
        const conversation = await Conversation.findById(groupid);
  
        //if no conversation is found sends error message
        if (!conversation) {
          return res.status(404).send("Conversation not found");
        }
        //if the conversation is found it adds the new message to the conversation and saves it
        conversation.messages.push(newMessage._id);
        await conversation.save();
  
        res.status(200).send({
          Message: `Message sent successfully\nFrom: ${req.session.userObject.username}\ngroup ID: ${groupid}`,
          Success: true,
        });
      } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).send(`Error occurred: ${error.message}`);
      }
    } else {
      res.status(401).send("Unauthorized");
    }
  });
  groupRoutes.post("/delete-group-letter", async (req, res) => {
    const { id, groupid } = req.body;
  
    try {
      if (req.session.userObject) {
        const group = await Group.findOne({
          _id: groupid,
        });
  
        const letter = group.letters.find((letter) => letter._id.equals(id));
  
        if (!letter) {
          res.status(404).send({ Message: "no letters found", Success: false });
        }
  
        await letter.deleteOne();
  
        await group.save();
  
        res.send({ Message: "letter deleted successfully", Success: true });
      } else {
        res.status(400).send({ Message: "Unauthorized", Success: false });
      }
    } catch (error) {
      console.error(error);
      res.send(error.message);
    }
  });
  
  groupRoutes.post("/delete-group-post", async (req, res) => {
    const { id, groupid } = req.body;
  
    try {
      if (req.session.userObject) {
        const group = await Group.findOne({
          _id: groupid,
        });
  
        const post = group.posts.find((post) => post._id.equals(id));
  
        if (!post) {
          res.status(404).send({ Message: "no posts found", Success: false });
        }
  
        await post.deleteOne();
  
        await group.save();
  
        res.send({ Message: "post deleted successfully", Success: true });
      } else {
        res.status(400).send({ Message: "Unauthorized", Success: false });
      }
    } catch (error) {
      console.error(error);
      res.send(error.message);
    }
  });
  
  groupRoutes.post("/edit-group-letter", async (req, res) => {
    const { id, content, title, groupid } = req.body;
    try {
      if (!req.session.userObject) {
        return res.status(400).send({ Message: "Unauthorized", Success: false });
      }
      const group = await Group.findOne({
        _id: groupid,
      });
  
      if (!group) {
        return res
          .status(404)
          .send({ Message: "No users found", Success: false });
      }
  
      const letter = group.letters.find((letter) => letter._id.equals(id));
  
      if (!letter) {
        return res
          .status(404)
          .send({ Message: "No letters found", Success: false });
      }
  
      letter.letterContent = content;
      letter.letterHead = title;
  
      await group.save();
  
      res.send({ Message: "Edit success", Success: true });
    } catch (error) {
      console.error(error);
      res.status(500).send({ Message: error.message, Success: false });
    }
  });
  
  groupRoutes.post("/new-group-letter", async (req, res) => {
    const { title, contents, groupid } = req.body;
  
    if (req.session.userObject) {
      try {
        const group = await Group.findOne({
          _id: groupid,
        }).select("letters");
  
        if (!group) {
          return res.status(404).send("No user found");
        }
  
        group.letters.push({ letterContent: contents, letterHead: title });
        await group.save();
  
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
  
  groupRoutes.post("/like-group-letter", async (req, res) => {
    const { letterId, groupid } = req.body;
  
    if (req.session.userObject) {
      try {
        const group = await Group.findOne({ _id: groupid });
        if (!group) {
          return res.status(404).send("User not found");
        }
  
        const letter = group.letters.find((letter) => letter.id === letterId);
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
        await group.save();
  
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
  groupRoutes.post("/comment-group-letter", async (req, res) => {
    const { letterId, comment, groupid } = req.body;
  
    if (req.session.userObject) {
      try {
        const group = await Group.findOne({ _id: groupid });
        if (!group) {
          return res.status(404).send("User not found");
        }
  
        const letter = group.letters.find((letter) => letter.id === letterId);
        if (!letter) {
          return res.status(404).send("Letter not found");
        }
  
        letter.comments.push({
          commenterId: req.session.userObject.id,
          commenterUsername: req.session.userObject.username,
          comment: comment,
        });
        await group.save();
  
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
  
  
  const gppUpload = multer({ storage: multer.memoryStorage() });
  
  groupRoutes.post("/new-group-profilepicture", gppUpload.single("img"), async (req, res) => {
    const img = req.file.buffer
    const {groupid} = req.body;
  
    if (!req.session.userObject) {
      return res.status(401).send("Unauthorized");
    }
    const resizedImg = await imageResizer(img);

    const outputPath = path.join(__dirname, '../profilepictures/', `resized-image-${Date.now()}.webp`);
    fs.writeFileSync(outputPath, resizedImg);
  
    try {
      const group = await Group.findOne({
        _id: groupid,
      });
  
      if (!group) {
        return res.status(404).send("No user found");
      }
  
      // Update profile picture
      group.groupProfilePicture = outputPath;
  
      // Save the updated user
      await group.save();
  
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

  
  
  const GroupUpload = multer({ storage: multer.memoryStorage() });
  
  groupRoutes.post("/new-group-post", GroupUpload.single("img"), async (req, res) => {
    const { description, groupid } = req.body;
    const img = req.file.buffer
  
    if (req.session.userObject) {
      try {
        const group = await Group.findOne({
          _id: groupid,
        }).select("posts");
  
        if (!group) {
          return res.status(404).send("No user found");
        }
        const resizedImg = await imageResizer(img);

        const outputPath = path.join(__dirname, '../uploads/', `resized-image-${Date.now()}.webp`);
        fs.writeFileSync(outputPath, resizedImg);
  
        // Push the post with the image URL to the user's posts
        group.posts.push({ postImg: outputPath, postContent: description });
        await group.save();
  
        return res.status(200).send("Successfully uploaded post");
      } catch (error) {
        console.error(error);
        return res.status(500).send(`Error occurred: ${error.message}`);
      }
    } else {
      return res.status(401).send("You must be logged in to add a new post");
    }
  });
  
  groupRoutes.post("/like-group-post", async (req, res) => {
    const { postId, groupid } = req.body;
  
    if (req.session.userObject) {
      try {
        const group = await Group.findOne({ _id: groupid });
        if (!group) {
          return res.status(404).send("User not found");
        }
  
        const post = group.posts.find((post) => post.id === postId);
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
        await group.save();
  
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
  
  groupRoutes.post("/comment-group-post", async (req, res) => {
    const { postId, comment, groupid } = req.body;
  
    if (req.session.userObject) {
      try {
        const group = await Group.findOne({ _id: groupid });
        if (!group) {
          return res.status(404).send("User not found");
        }
  
        const post = group.posts.find((post) => post.id === postId);
        if (!post) {
          return res.status(404).send("Post not found");
        }
  
        post.comments.push({
          commenterId: req.session.userObject.id,
          commenterUsername: req.session.userObject.username,
          comment: comment,
        });
  
        await group.save();
  
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
  
  groupRoutes.get("/group-data", async (req,res)=>{
    const {id} = req.query;
    if(req.session.userObject){
      try {
        const group = await Group.findById(id)
        if(!group){
          return res.status(404).send({Message: "No group found", Success: false})
        }
        const filepath = group.groupProfilePicture;
        const base64Image = await getBase64(filepath);

          const posts = await Promise.all(
          group.posts.map(async (post) => {
            const filePath = post.postImg;
            const base64PostImage = await getBase64(filePath);
            return {
                img: `data:image/webp;base64,${base64PostImage}`,
                ...post._doc,
            };
          })
          )

        res.status(200).send({Success: true, groupData: group, groupPosts: posts, profilepic: `data:image/webp;base64,${base64Image}`})
      } catch (error) {
        console.error(`Server Error --> ${error}`)
        res.status(500).send({Message: `Server Error --> ${error.message}`, Success: false})
      }
    } else{
      res.status(404).send({Message: "You must be logged in", Success: false})
    }
  })
  
  //message history endpoint
  groupRoutes.get("/group-message-history", async (req, res) => {
    const {groupid} = req.query;
    //makes sure your logged in before grabbing the info
    if (req.session.userObject) {
      try {
        //finds your user in object in database based off your id
        const group = await Group.findOne({ _id: groupid });
  
        //if you do not have any conversations yet sends a error message
        if (!group.conversations || group.conversations.length === 0) {
          return res.status(200).send("No messages found.");
        }
  
        //For every existing conversation connected to your account id it will create a promise that returns
        //the conversation participant name, conversation id and all messages which have been sent in the conversation
        const convoPromises = group.conversations.map(async (convo) => {
            let output = convo.participantName;
    
            //for each instance it will find the conversation by the id given then populate it with all message ids which
            //reference the message schema and populate the conversation with them
            const conversation = await Conversation.findById(convo.id).populate(
              "messages"
            );
    
            //if no conversation with that id is found returns error message
            if (!conversation) {
              return output + "Conversation not found.\n";
            }
    
            //maps out each message which was populated within the conversation object and extracts its content and sender info
            const msgs = conversation.messages.map((msg) => {
              return `${
                msg.sender.equals(req.session.userObject.id) ? "You" : convo.participantName
              }: ${msg.content}`;
            });
    
            let conv = {
              head: output,
              convoID: String(convo.id),
              msgs: msgs,
            };
            //returns messages along with convo id and "output" which is just the recipent name of your conversation
            return conv;
        });
  
        //creates conversation object which stores all conversation promises
        const convos = await Promise.all(convoPromises);
  
        //sends conversations upon completion
        res.send({ convos: convos, Success: true });
      } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
      }
    } else {
      res.status(401).send("Unauthorized");
    }
  });
  
  groupRoutes.post("/create-group-conversation", async (req, res) => {
    const { message, groupid } = req.body;
  
    if (req.session.userObject) {
      try {
        const group = await Group.findOne({ _id: groupid });
        const your = await User.findOne({
          username: req.session.userObject.username,
        });
  
        if (!group) {
          return res.status(404).send("Group not found");
        }
  
        // Create an array of participants as ObjectIds
        const participants = [
          your._id,
          ...group.participants.map(p => p.participant_id),
        ];
  
        // // Check if a conversation already exists between these participants
        // const hasConversation = await Conversation.findOne({
        //   participants: { $all: participants },
        // });
  
        // if (hasConversation) {
        //   return res.status(400).send("You already have a conversation with this group");
        // }
  
        const newMessage = {
          content: message,
          sender: your._id,
        };
  
      
        const nMessage = new Message({
          content: newMessage.content,
          sender: newMessage.sender,
        });
        await nMessage.save();
  
       
        const conversation = new Conversation({
          participants,  
          messages: [nMessage._id],
        });
  
        group.conversations.push({
          id: conversation._id,
          participantName: [...group.participants.map(p => p.participant_name)],
        });
  
        await conversation.save();
        await group.save();
        await your.save();
  
        res.status(200).send({
          Message: `Message sent successfully\nfrom user: ${req.session.userObject.username}\nfrom id: ${req.session.userObject.id}\nMessage Content: ${message}\nConversation created\nconvo id: ${conversation._id}`,
          Success: true,
        });
      } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).send(`Internal server error: ${error.message}`);
      }
    } else {
      res.status(401).send("You must be logged in to send a message");
    }
  });

 

    groupRoutes.post("/accept-participant", async (req, res) => {
      const { username, groupid } = req.body;
      console.log("Incoming Request:", req.body);
    
      if (req.session.userObject) {
        try {
          const group = await Group.findById(groupid);
          if (!group) {
            return res.status(404).send({ Message: "No group found", Success: false });
          }
    
          const requestedParticipant = await User.findOne({ username: username });
          if (!requestedParticipant) {
            return res.status(404).send({ Message: "No user found", Success: false });
          }
    
    
          const isAdmin = group.groupAdmins.find(admin => admin.id === req.session.userObject.id);
          if (group.owner.owner_name === req.session.userObject.username || isAdmin) {
            // Remove requested participant
            group.requested_participants = group.requested_participants.filter(
              participant => !participant.participant_id.equals(requestedParticipant._id)
            );
    
            // Add participant to the group
            group.participants.push({
              participant_id: requestedParticipant._id,
              participant_name: requestedParticipant.username,
              participant_profilePic: requestedParticipant.profilepic
            });
    
            await group.save();
    
            res.status(200).send({ Message: `Successfully Added ${requestedParticipant.username} to the group (${group.groupName})!`, Success: true });
          } else {
            console.log("Permission Denied:", req.session.userObject.username);
            res.status(400).send({ Message: "You do not have permission to accept join requests", Success: false });
          }
    
        } catch (error) {
          console.error("Error processing request:", error);
          res.status(500).send({ Message: `Internal Server Error ---> ${error.message}`, Success: false });
        }
      } else {
        res.status(401).send({ Message: "Unauthorized", Success: false });
      }
    });

    groupRoutes.post("/deny-participant", async (req,res)=>{
      const {username, groupid} = req.body;
      if(req.session.userObject){
        try {
          const group = await Group.findById(groupid)

          if(!group){
            return res.status(404).send({Message: "No group found", Success: false})
          }
          const requestedParticipant = await User.findOne({username: username})

          if(!requestedParticipant){
            return res.status(404).send({Message: "No user found", Success: false})
          }

          const isAdmin = group.groupAdmins.find(admin => admin.id === req.session.userObject.id);

          if(group.owner.owner_name === req.session.userObject.username || isAdmin){

            group.requested_participants = group.requested_participants.filter(
              participant => !participant.participant_id.equals(requestedParticipant._id)
            );

            await group.save()

            res.status(200).send({Message: "Successfully Denied Request", Success: true})
          } else{
            console.log("Permission Denied:", req.session.userObject.username);
            res.status(400).send({Message: "You do not have permission to accept join requests", Success: false})
          }

        } catch (error) {
          res.status(500).send({Message: `Internal Server Error ---> ${error.message}`, Success: false})
          console.error("Error processing request:", error);
        }
      }else{
        res.status(400).send({Message: "You must be logged in", Success: false})
      }
    })

  module.exports = groupRoutes;
  