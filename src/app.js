const express = require("express");
const userRouter = require("./routes/userRouter");
const petRouter = require("./routes/petRouter");
const swaggerSetup = require("../swaggers/swaggerSetup");
const userJob = require("./jobs/userJob");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
swaggerSetup(app);
userJob.userLocationReminder();

app.get("/", (req, res) => {
  res.send("Welcome to home page of Node Pets Project");
});

app.use("/user", userRouter);
app.use("/pet", petRouter);

module.exports = app;
