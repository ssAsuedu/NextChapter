import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  privacy: { type: String, enum: ["private", "public"], default: "private" },
  books: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const List = mongoose.model("List", listSchema);

export default List;