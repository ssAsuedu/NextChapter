import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema({
  senderEmail: { type: String, required: true },
  receiverEmail: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("FriendRequest", friendRequestSchema);