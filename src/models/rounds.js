import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
    {
        dice1: { type: Number, required: true },
        dice2: { type: Number, required: true },
        multiplierValue: { type: Number },
        multiplierChoice: { type: String },
    },
    { _id: false }
);

const settlementResultSchema = new mongoose.Schema(
    {
        up: { type: Boolean, default: false },
        down: { type: Boolean, default: false },
        seven: { type: Boolean, default: false },
    },
    { _id: false }
);

const schema = new mongoose.Schema({
    id: { type: Number, required: true },
    result: resultSchema,
    settlementResult: settlementResultSchema,
    time: { type: Date, default: new Date() },
    exchangeRateId: { type: Number, require: true },
});

export const rounds = mongoose.model("sevenupdown_round", schema);
