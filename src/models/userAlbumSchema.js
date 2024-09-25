const mongoose = require("mongoose");

const userAlbumSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    profilePicture: String,
    gallery: [String],
  },
  { timestamps: true }
);

const UserAlbum = mongoose.model("UserAlbum", userAlbumSchema);
module.exports = UserAlbum;
