import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  cognitoSub: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  friends: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  bookshelf: [{ type: String }],
  progress: [
    {
      volumeId: String,
      currentPage: Number,
      totalPages: Number,
    },
  ],
  badges: [
    {
      type: { type: String, required: true },
      // volumeid is optional for some badges, default to null 
      volumeId: { type: String, default: null }, 
      earnedAt: { type: Date, default: Date.now },
    }
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
