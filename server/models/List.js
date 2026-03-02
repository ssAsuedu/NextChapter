import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  privacy: { type: String, enum: ["private", "public"], default: "private" },
  books: [{ type: String }],
  pinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const List = mongoose.model("List", listSchema);

export default List;