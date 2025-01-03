const User = require("../schemas/UserSchema");
const Message = require("../schemas/MessageSchema");
const Conversation = require("../schemas/ConversationSchema");
const jwt = require("jsonwebtoken");
const mailer = require("../js/Mailer")
const Notification = require('../schemas/NotificationSchema');


const hash = require("../js/hash");
const JWT_SECRET = process.env.JWT_SECRET;
const auth = require('../middleware/auth')

//Bcrypt for password hashing
const bcrypt = require("bcrypt");

const express = require("express")
const userRoutes = express.Router()

//Registration endpoint
userRoutes.post("/register", async (req, res) => {
    //grab email, username, and password from the request body for account creation
    const { username, email, password } = req.body;
  
    //make sure every username is unique (makes it easier to search for users without needing id)
    const isUsernameUnique = await User.findOne({ username: username });
  
    if (username === isUsernameUnique?.username) {
      res.status(300).send({
        Message: `Username taken: ${username} is an invalid username`,
        Success: false,
      });
    } else {
      //continues script if the username chosen is unique
      try {
        //hash password to be securely stored in database
        const hashedPassword = await hash(password);
  
        //creates a new user schema / entry to database then saves the info to the database
        const user = new User({
          username: username,
          email: email,
          password: hashedPassword,
        });
  
        await user.save();
  
        console.log(
          `NEW USER UPLOADED\nUSERNAME: ${user.username}\nUSER EMAIL: ${user.email}\nUSER ID: ${user._id}\nWELCOME`
        );
        res.status(200).send({
          Message: `SUCCESSFUL REGISTRATION\nWELCOME ${user.username}\nYOUR USER ID IS: ${user._id}\nEMAIL: ${user.email}`,
          Success: true,
        });
      } catch (error) {
        console.error("ERROR: ", error.message);
        res.status(500).send({
          Message: `INTERNAL SERVER ERROR: ${error.message}`,
          Success: false,
        });
      }
    }
  });
  
  //Login endpoint
  userRoutes.post("/login", async (req, res) => {
    //username and password needed to login
    const { username, password } = req.body;
  
    try {
      //searches the database for the user with that specific username, if none returns an error message
      const user = await User.findOne({ username: username });
      if (!user) {
        return res.status(400).send({ Message: "No users found" });
      }
      //if user is found we use bcrypt compare method to see if the password matches the hashed one in database
      const isMatch = await bcrypt.compare(password, user.password);
  
      //if the password is correct you successfully log in and a user session cookie is created
      if (isMatch) {
        const token = jwt.sign({ username: user.username, email: user.email, id: String(user._id), objID: user._id, profilePic: user.profilepic,}, JWT_SECRET, { expiresIn: '2h' });
      
  
        console.log(`LOGIN SUCESS\nWELCOME BACK ${user.username}`);
        //sends user info to front-end
        res.status(200).send({
          message: `LOGIN SUCESS. WELCOME BACK ${user.username}`,
          login: true,
          token: token,
          username: user.username,
          userid: user._id
        });
      } else {
        res.status(400).send({ Message: "Invalid Credentials", login: false });
      }
    } catch (error) {
      console.log("Server Error %d", error.message);
      res
        .status(400)
        .send({ message: `server error: ${error.message}`, login: false });
    }
  });
  
  //create conversation endpoint
  userRoutes.post("/create-conversation", auth, async (req, res) => {
    //to create a conversation you must choose a user to send to and send a message
    const { message, toUsername } = req.body;
  
    //checks if user is logged in, if not you cannot send a message
      try {
        //grabs user info for both sender and recipent for conversation creation
        const user = await User.findOne({ username: toUsername });
  
        //if no user if found sends error message
        if (!user) {
          return res.status(404).send("Recipient not found");
        }
  
        const hasConversation = await Conversation.findOne({
          participants: [user._id, req.user._id],
        });
  
        if (hasConversation) {
          return res
            .status(400)
            .send(`You Already have a conversation with ${user.username}`);
        }
  
        const newMessage = {
          content: message,
          sender: req.user._id,
        };
  
        //creates a new message schema / entry and saves it to the database with message content and sender id
        const nMessage = new Message({
          content: newMessage.content,
          sender: newMessage.sender,
        });
  
        await nMessage.save();
  
        //creates a new conversation schema / entry saves it database, adds conversation id to both recipent and sender schemas
        //also adds the first message sent in the conversation
        const conversation = new Conversation({
          participants: [newMessage.sender, user._id],
          messages: [nMessage._id],
        });
  
        user.conversations.push({
          id: conversation._id,
          participantName: req.user.username,
        });
  
        req.user.conversations.push({
          id: conversation._id,
          participantName: user.username,
        });

        const notification = new Notification({
          content: `You received a message from ${req.user.username}`,
          subject: `Message Notification`,
        })
        await notification.save();

        mailer(user.email, notification.subject, notification.content)
        .then(info => {
          console.log("Email info:", info)
        })
        .catch(err => {
          console.error("Failed to send email:", err)
        })

        user.notifications.push(notification._id)
  
        //saves all changes to database
        await conversation.save();
        await user.save();
        await req.user.save();
  
        res.status(200).send({
          Message: `Message sent successfully\nto user: ${user.username}\nto id: ${user._id}\nfrom user: ${req.user.username}\nfrom id: ${req.user._id}\nMessage Content: ${message}\nConversation created\nconvo id: ${conversation._id}`,
          Success: true,
        });
      } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).send(`Internal server error: ${error.message}`);
      }
  });
  
  // Sends session user object containing username, email, id
  userRoutes.get("/collect-cookie", auth, (req, res) => {
    try {
        res.status(200).send({ userCookie: req.token, valid: true });
      
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ message: "internal server error" });
    }
  });
  
  //send message to pre existing conversation endpoint
  userRoutes.post("/send-message", auth, async (req, res) => {
    // you need a message, conversation id, and a recipent
    const { message, toUsername, convoID } = req.body;
  
    //makes sure your logged in before sending the message
      try {
        //creates new message entry to database and saves it
        const newMessage = new Message({
          content: message,
          sender: req.user._id,
        });

        const user = await User.findOne({username: toUsername}).select("email notifications username");
        
        await newMessage.save();
  
        //finds conversation by id given to add the message to
        const conversation = await Conversation.findById(convoID);
  
        //if no conversation is found sends error message
        if (!conversation) {
          return res.status(404).send("Conversation not found");
        }
        //if the conversation is found it adds the new message to the conversation and saves it
        conversation.messages.push(newMessage._id);

        await conversation.save();

        const notification = new Notification({
          content: `You received a message from ${req.user.username}`,
          subject: `Message Notification`,
          
        })
        await notification.save();

        mailer(user.email, notification.subject, notification.content)
        .then(info => {
          console.log("Email info:", info)
        })
        .catch(err => {
          console.error("Failed to send email:", err)
        })

        user.notifications.push(notification._id)
        await user.save()
        console.log(`message sent to conversation ${conversation._id}`)
        res.status(200).send({
          Message: `Message sent successfully\nTo user: ${toUsername}\nFrom: ${req.user.username}\nConvo ID: ${convoID}`,
          Success: true,
        });
      } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).send(`Error occurred: ${error.message}`);
      }
   
  });
  
  //message history endpoint
  userRoutes.get("/message-history", auth, async (req, res) => {
    //makes sure your logged in before grabbing the info

      try {
        //finds your user in object in database based off your id
        const user = await User.findOne({ _id: req.user._id });
  
        //if you do not have any conversations yet sends a error message
        if (!user.conversations || user.conversations.length === 0) {
          return res.status(200).send("No conversations found.");
        }
  
        //For every existing conversation connected to your account id it will create a promise that returns
        //the conversation participant name, conversation id and all messages which have been sent in the conversation
        const convoPromises = user.conversations.map(async (convo) => {
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
              msg.sender.equals(user._id) ? "You" : convo.participantName
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
   
  });

  userRoutes.get("/conversation", async (req,res)=>{
    const {id} = req.query;
    try {
      const conversation = await Conversation.findById(id).populate("messages");

      if(!conversation){
        return res.status(404).send({Message: "No conversation found", Success: false})
      }

      return res.status(200).send({Message: "Conversation found", data: conversation, Success: true})

    } catch (error) {
      console.error(`Error occurred finding conversation by id\nURL: ${req.url}\nError: ${error}`)
      return res.status(500).send({Message: "Server error", url: req.url, error: error.message, Success: false})
    }
  })

  userRoutes.get("/notifications", auth, async (req,res)=>{
    try {
      const user = await User.findOne({username: req.user.username}).select("notifications").populate("notifications").lean()

      if(!user){
        res.status(404).send({Message: "You have no notifications", Success: false})
      } 
      console.log(user.notifications)
      res.send({Success: true, notifications: user.notifications})

    } catch (error) {
      console.error(`Error fetching notifications\nError: ${error}`)
      res.status(500).send({Message: "Error fetching notifications", url: req.url, error: error.message, Success: false})
    }
    
  })

  userRoutes.delete("/notifications", auth, async (req,res)=>{
    try {
      req.user.notifications = [];
      await req.user.save()
      res.send({Message: "deleted successfully", Success: true})
    } catch (error) {
      console.error(error)
      res.status(500).send({Message: "Error deleting notifications", Success: false})
    }
  })
  

  module.exports = userRoutes;