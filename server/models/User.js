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
  // Reading streak tracking
  readingActivity: [
    {
      date: { type: String, required: true },
      minutesRead: { type: Number, default: 0 },
      frozen: { type: Boolean, default: false },
    }
  ],
  streakFreezesUsed: { type: Number, default: 0 },
  // Book journal entries (private notes per book)
  journalEntries: [
    {
      volumeId: { type: String, required: true },
      title: { type: String, default: "" },
      content: { type: String, required: true, maxlength: 5000 },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    }
  ],
});

const User = mongoose.model("User", userSchema);

export default User;