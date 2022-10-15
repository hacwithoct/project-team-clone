// importing the express and other dependencies in our server
const express = require("express");
// creating our server
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const path = require("path");
const {
  getUserName,
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/user");
const { validRoom, createRoom } = require("./utils/check_room");
const { addMessage, getMessage } = require("./utils/message");
const {Feedback}=require('./models/meeting')
const moment = require("moment");
// setting port to 3030 if in development else will pick it from environment vaiable
const port = process.env.PORT || 3030;
// setting ejs as our view engine for rendering pages
app.set("view engine", "ejs");
// setting public as static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/meet", express.static("public"));
app.use("/chat", express.static("public"));
// telling express for using urlencoder
app.use(express.urlencoded({ extended: true }));
// rendering home page if requested
app.get("/", (req, res) => {
  res.render("home");
});
// rendering meet page if requested
app.get("/meet", (req, res) => {
  res.render("meet");
});
// rendering about page if requested
app.get("/about", (req, res) => {
  res.render("about");
});
// rendering meeting ended page if requested
app.get("/meet/ended", (req, res) => {
  res.render("end");
});
// rendering chat login page if requested
app.get("/chat", (req, res) => {
  res.render("chat");
});
// rendering feedback page if requested
app.get("/feedback", (req, res) => {
  res.render("feedback");
});
// posting our feedback on database if requested
app.post("/feedback", (req, res) => {
  let newFeedback=new Feedback({name:req.body.name,email:req.body.email,subject:req.body.subject,message:req.body.message})
  newFeedback.save();
  res.render("error", {
    errorMsg1: "Thanks for your valuable feedback!",
    errorMsg2:
    "We are trying to improve and your feedback and suggestions help us!",
  });
});
// sending request to destination room
app.post("/chat", (req, res) => {
  let roomId = req.body.meet;
  res.redirect(`/chat/${roomId}`);
});
// validating room for chating
// - if correct room is requested room is rendered
// - error page is displayed with respective error
app.get("/chat/:roomid", async (req, res) => {
  let ans = await validRoom(req.params.roomid);
  if (ans) {
    res.render("chatroom", {
      users: await getRoomUsers(req.params.roomid),
      room: req.params.roomid,
      messages: await getMessage(req.params.roomid),
    });
  } else {
    res.render("error", {
      errorMsg1: "Chat not found!",
      errorMsg2: "Check you meet link or create new meet!",
    });
  }
});
// validating room for meeting
// - if correct room is requested room is rendered
// - error page is displayed with respective error
app.get("/meet/:room/", async (req, res) => {
  let ans = await validRoom(req.params.room);
  if (ans) {
    res.render("room", { roomId: req.params.room });
  } else {
    res.render("error", {
      errorMsg1: "Meeting not found!",
      errorMsg2: "Check you meet link or create new meet!",
    });
  }
});
// for all the get request displaying error message
app.get("*", (req, res) => {
  res.render("error", {
    errorMsg1: "404 Page Not Found",
    errorMsg2: "What are you looking for?",
  });
});
// for all the post request displaying error message
app.post("*", (req, res) => {
  res.render("error", {
    errorMsg1: "404 Page Not Found",
    errorMsg2: "What are you looking for?",
  });
});