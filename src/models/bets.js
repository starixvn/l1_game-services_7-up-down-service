import mongoose from "mongoose";

const betSchema = {
    uid: { type: String, required: true },
    name: { type: String, required: true },

    up: { type: Number, default: 0 },
    down: { type: Number, default: 0 },
    seven: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    betwin: { type: Number, default: 0 },

    time: { type: Date },
    odds: { type: Object },
    freeBet: { type: Boolean, default: false },
    roundId: { type: Number, default: 0, required: true },
    paid: { type: Boolean, default: false },

    currency: { type: String, required: true },
    playerId: { type: String, required: true },
    siteId: { type: String, required: true },
    rate: { type: Number, required: true },
    operatorId: { type: String, required: true },
    reachMaxWin: { type: Boolean, default: false },
    maxWin: { type: Number, default: 0 },
};

export const bets = mongoose.model("sevenupdown_bet", new mongoose.Schema(betSchema));
