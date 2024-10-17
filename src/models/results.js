import mongoose from "mongoose";
import { Core } from "sc-game-base";

export const results = mongoose.model("sevenupdown_results", Core.Models.ResultSchema);
