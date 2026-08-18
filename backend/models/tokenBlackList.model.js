import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
});

const TokenBlacklist =
  mongoose.models.tokenBlacklist ||
  mongoose.model("tokenBlacklist", tokenBlacklistSchema);

export default TokenBlacklist;