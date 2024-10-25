import { stubMongoose } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { Core } from "sc-game-base";
import ProcessBetQueue from "../../../src/crons/process-bet-queue";
import gameSettings from "../../../src/game-settings";

const definition = new Core.GameDefinition(gameSettings);
const gameManagementApiClientFactory = { instance: jest.fn() };
const betsRepository = stubMongoose(mongoose.Model);
const betLogsRepository = stubMongoose(mongoose.Model);
const gameData = new Core.GameData(gameSettings.durations.wholeRound);
gameData.gameConfigs = {
    odds: {},
    maxWinPerRound: 1000,
};
gameData.currencyGroupGames = [{ groupId: "1", maxBet: 500 }];

describe("ProcessBetQueue", () => {
    let processBetQueue;

    beforeEach(() => {
        processBetQueue = new ProcessBetQueue({ definition, gameData, gameManagementApiClientFactory, betsRepository, betLogsRepository });
    });
    const player = {
        UID: "player123",
        profile: { name: "John Doe", maxBet: 2000 },
        session: {
            siteId: "site1",
            currencyName: "USD",
            operatorId: "op1",
            playerId: "123456",
            currencyGroupId: "1",
        },
    };
    describe("upsertBet", () => {
        it("should upsert a bet correctly", async () => {
            const roundId = 123;
            const bet = { betChoice: "up", amount: 100, freeBet: false };
            const rate = 1;

            await processBetQueue.upsertBet(player, roundId, bet, rate);

            expect(betsRepository.updateOne).toHaveBeenCalledWith(
                { uid: "player123", roundId, freeBet: false },
                {
                    $inc: { [bet.betChoice]: 100, totalAmount: 100 },
                    $setOnInsert: expect.objectContaining({
                        uid: player.UID,
                        name: player.profile.name,
                        odds: gameData.gameConfigs.odds,
                        freeBet: false,
                        roundId,
                        maxWin: 500000,
                        siteId: player.session.siteId,
                        currency: player.session.currencyName,
                        rate,
                        operatorId: player.session.operatorId,
                        playerId: player.session.playerId,
                    }),
                },
                { upsert: true, setDefaultsOnInsert: true }
            );
        });
    });

    describe("getMaxWinPerRound", () => {
        it("should calculate max win per round correctly", () => {
            const result = processBetQueue.getMaxWinPerRound(player);

            expect(result).toBe(500000); // 1000 (maxWinPerRound) * 500 (min of player maxBet and settings maxBet)
        });
    });
});
