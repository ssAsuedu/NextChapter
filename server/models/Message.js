import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  volumeId: { type: String, default: null },
  title: { type: String, default: null },
  coverUrl: { type: String, default: null },
  author: { type: String, default: null },
  messageText: { type: String },
  type: { type: String, enum: ["book_recommendation", "badge_share", "text"], default: "book_recommendation" },
  badgeType: { type: String, default: null },
  badgeCount: { type: Number, default: null },
  unread: { type: String, enum: ["unread", "read"], default: "unread" },
  sentAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

export default Message;