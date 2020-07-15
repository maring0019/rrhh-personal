const mongoose = require("mongoose");
const { Schema } = mongoose;

const historySchema = new Schema(
  {
    collectionName: String,
    collectionId: Schema.Types.ObjectId,
    method: String,
    diff: {},
    htmlDiff: String,
    user: {},
    reason: String,
    version: { type: Number, min: 0 }
  },
  {
    timestamps: true
  }
);

module.exports = { model: mongoose.model("History", historySchema) };