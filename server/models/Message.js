import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  volumeId: { type: String, required: true },
  title: { type: String, required: true },
  messageText: { type: String },
  unread: { type: String, enum: ["unread", "read"], default: "unread" },
  sentAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

export default Message;