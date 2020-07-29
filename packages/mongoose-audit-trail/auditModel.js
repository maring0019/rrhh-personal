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
    timestamps: { currentTime: () => timestamp() }
  }
);

function timestamp(){
  const f = new Date();
  return new Date(Date.UTC(f.getFullYear(),f.getMonth(),f.getDate(),f.getHours(),f.getMinutes()));
}

module.exports = { model: mongoose.model("History", historySchema) };