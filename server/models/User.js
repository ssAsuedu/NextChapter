import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  bookshelf: [{ type: String }], // Array of Google Books volume IDs
});

const User = mongoose.model("User", userSchema);

export default User;
