import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  bookshelf: [{ type: String }],
  progress: [
    {
      volumeId: String,
      currentPage: Number,
      totalPages: Number,
    },
  ],
  reviews: [
    {
      volumeId: String,
      rating: Number,
      reviewText: String,
      createdAt: { type: Date, default: Date.now },
      updatedOn: { type: Date, default: Date.now }
    },
  ],
});

const User = mongoose.model("User", userSchema);

export default User;
