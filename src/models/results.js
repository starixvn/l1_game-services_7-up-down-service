import mongoose from "mongoose";
import { Core } from "sc-game-base";

export const results = mongoose.model("7up7down_results", Core.Models.ResultSchema);
