import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  volumeId: { type: String, required: true, index: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  reviewText: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now }
});

export default mongoose.model("Review", reviewSchema);