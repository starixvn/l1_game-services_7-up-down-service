import { stub, stubMongoose } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { Core } from "sc-game-base";
import { callAndForget } from "sc-game-base/src/core/game-management-api";
import { SettleGameRoundConsumer } from "../../../src/consumers";
import gameSettings from "../../../src/game-settings";
import { getSettlementResult } from "../../../src/helpers/result-helper";

jest.mock("sc-game-base/src/core/game-management-api", () => ({
    ...jest.requireActual("sc-game-base/src/core/game-management-api"),
    callAndForget: jest.fn(),
}));

const roundResultPublisher = stub(Core.BaseEventPublishers.RoundResultPublisher);
const userBetResultPublisher = stub(Core.BaseEventPublishers.UserBetResultPublisher);
const endGame = jest.fn();
const roundsRepository = stubMongoose(mongoose.Model);
const betsRepository = stubMongoose(mongoose.Model);
const resultsRepository = stubMongoose(mongoose.Model);

const generateResult = jest.fn();
const definition = new Core.GameDefinition(gameSettings, generateResult, getSettlementResult);
const gameData = new Core.GameData();
const gameConfigs = {
    odds: {
        up: 2,
        down: 2,
        seven: 5,
    },
    applyMultiplier: true,
    maxWinPerRound: 3000,
};
gameData.gameConfigs = { ...gameConfigs };

const gameManagementApiClient = {
    users: {
        updateBalance: jest.fn(),
    },
};
const gameManagementApiClientFactory = {
    instance: jest.fn(() => gameManagementApiClient),
};

describe("SettleGameRoundConsumer", () => {
    /**
     * @type {SettleGameRoundConsumer}
     */
    let consumer;

    beforeEach(() => {
        consumer = new SettleGameRoundConsumer({
            definition,
            gameData,
            roundResultPublisher,
            userBetResultPublisher,
            endGame,
            roundsRepository,
            betsRepository,
            gameManagementApiClientFactory,
            resultsRepository,
        });
        gameData.result = { dice1: 1, dice2: 2 };
        jest.spyOn(consumer, "queryBets").mockResolvedValue([]);
        jest.spyOn(consumer, "captureBetResult").mockImplementation(() => {});
        jest.spyOn(consumer, "formatEndGameInfo").mockReturnValue({
            gameInfo: {},
            settlementInfo: { red: 0 },
        });
    });

    afterEach(() => {
        gameData.gameConfigs = { ...gameConfigs };
        gameData.result = null;
        jest.clearAllMocks();
    });

    describe("calculateFinalOdds", () => {
        it.each([
            [
                {
                    dice1: 5,
                    dice2: 2,
                    multiplier: {
                        value: 2,
                        choice: "down",
                    },
                },
                {
                    ...gameConfigs.odds,
                    down: 3,
                },
            ],
            [
                {
                    dice1: 2,
                    dice2: 3,
                    multiplier: {
                        value: 2,
                        choice: "seven",
                    },
                },
                {
                    ...gameConfigs.odds,
                    seven: 9,
                },
            ],
            [
                {
                    dice1: 2,
                    dice2: 3,
                },
                {
                    ...gameConfigs.odds,
                },
            ],
        ])("should update odds of selected choices", (result, expectedOdds) => {
            //Arrange
            gameData.result = result;
            //Act
            const odds = consumer.calculateFinalOdds();

            //Assert
            expect(odds).toEqual(expectedOdds);
        });
    });

    describe("calculateBetResult", () => {
        const bet = {
            name: "player1",
            up: 2000,
            down: 0,
            seven: 0,
            totalAmount: 2000,
            maxWin: 5000,
        };

        const settlementResult = {
            up: true,
            down: false,
            seven: false,
        };

        describe("when totalwin < maxwin", () => {
            it("betResult.totalwin should keep its value", () => {
                //Act
                const betResult = consumer.calculateBetResult(settlementResult, bet, gameConfigs.odds);

                //Assert
                expect(betResult.totalWin).not.toEqual(bet.maxWin);
                expect(betResult.totalWin).toBe("4000.0000");
                expect(betResult.reachMaxWin).toBe(false);
            });
        });

        describe("when totalwin > maxwin", () => {
            it("betResult.totalwin should be set to maxwin", () => {
                //Act
                const betResult = consumer.calculateBetResult(settlementResult, bet, { ...gameConfigs.odds, up: 5 });

                //Assert
                expect(betResult.totalWin).toBe(bet.maxWin.toFixed(4));
                expect(betResult.reachMaxWin).toBe(true);
            });
        });

        describe("when bet loses", () => {
            it("should calculate correct loss amounts", () => {
                //Arrange
                const losingSettlementResult = {
                    up: false,
                    down: false,
                    seven: false,
                };

                //Act
                const betResult = consumer.calculateBetResult(losingSettlementResult, bet, gameConfigs.odds);

                //Assert
                expect(betResult.totalWin).toBe("0.0000");
                expect(betResult.totalLost).toBe(2000);
                expect(betResult.netWin).toBe(-2000);
            });
        });

        describe("when bet is a free bet", () => {
            it("should use effective odds (originalOdds - 1)", () => {
                //Arrange
                const freeBet = { ...bet, freeBet: true };

                //Act
                const betResult = consumer.calculateBetResult(settlementResult, freeBet, gameConfigs.odds);

                //Assert
                expect(betResult.totalWin).toBe("2000.0000"); // 2000 * (2 - 1) = 2000
            });
        });

        describe("when bet has multiple winning choices", () => {
            it("should sum all winning amounts", () => {
                //Arrange
                const multiBet = {
                    ...bet,
                    up: 1000,
                    down: 1000,
                    totalAmount: 2000,
                };
                const multiSettlementResult = {
                    up: true,
                    down: true,
                    seven: false,
                };

                //Act
                const betResult = consumer.calculateBetResult(multiSettlementResult, multiBet, gameConfigs.odds);

                //Assert
                expect(betResult.totalWin).toBe("4000.0000"); // 1000*2 + 1000*2 = 4000
                expect(betResult.winningByChoices.up).toBe(2000);
                expect(betResult.winningByChoices.down).toBe(2000);
            });
        });
    });

    describe("settleBets", () => {
        it("should not process bets when no bets found", async () => {
            //Arrange
            consumer.queryBets.mockResolvedValue([]);

            //Act
            await consumer.settleBets({
                settlementResult: { up: true, down: false, seven: false },
                roundId: 1,
                time: new Date(),
            });

            //Assert
            expect(consumer.queryBets).toHaveBeenCalledWith(1);
            expect(endGame).not.toHaveBeenCalled();
        });

        it("should process bets and update bet properties", async () => {
            //Arrange
            gameData.result = { dice1: 1, dice2: 2 };
            const bet = {
                uid: "user1",
                rate: 1,
                up: 1000,
                down: 0,
                seven: 0,
                totalAmount: 1000,
                maxWin: 5000,
                save: jest.fn().mockResolvedValue(true),
            };
            consumer.queryBets.mockResolvedValue([bet]);
            endGame.mockResolvedValue({ isOk: true });

            //Act
            await consumer.settleBets({
                settlementResult: { up: true, down: false, seven: false },
                roundId: 1,
                time: new Date(),
            });

            //Assert
            expect(bet.betwin).toBeDefined();
            expect(bet.paid).toBe(true);
            expect(bet.reachMaxWin).toBeDefined();
            expect(bet.save).toHaveBeenCalled();
            expect(endGame).toHaveBeenCalled();
            expect(consumer.captureBetResult).toHaveBeenCalledWith(bet.uid, expect.any(Object), bet.rate);
            expect(userBetResultPublisher.publish).toHaveBeenCalledWith(bet.uid, expect.any(Object));
        });

        it("should not publish when endGame fails", async () => {
            //Arrange
            gameData.result = { dice1: 1, dice2: 2 };
            const bet = {
                uid: "user1",
                rate: 1,
                up: 1000,
                down: 0,
                seven: 0,
                totalAmount: 1000,
                maxWin: 5000,
                save: jest.fn().mockResolvedValue(true),
            };
            consumer.queryBets.mockResolvedValue([bet]);
            endGame.mockResolvedValue({ isOk: false, response: "Error" });

            //Act
            await consumer.settleBets({
                settlementResult: { up: true, down: false, seven: false },
                roundId: 1,
                time: new Date(),
            });

            //Assert
            expect(userBetResultPublisher.publish).not.toHaveBeenCalled();
        });
    });

    describe("callEndGame", () => {
        it("should call endGame and handle successful response", async () => {
            //Arrange
            const bet = {
                uid: "user1",
                up: 1000,
                down: 0,
                seven: 0,
                totalAmount: 1000,
            };
            const betResult = {
                totalWin: "2000.0000",
                totalBetAmount: 1000,
                netWin: "1000.0000",
            };
            const roundId = 1;
            const time = new Date();
            endGame.mockResolvedValue({ isOk: true });
            consumer.formatEndGameInfo.mockReturnValue({
                gameInfo: { gameId: "test" },
                settlementInfo: { red: 0 },
            });

            //Act
            const result = await consumer.callEndGame(bet, roundId, time, betResult);

            //Assert
            expect(endGame).toHaveBeenCalledWith(bet.uid, expect.any(Object), expect.any(Object));
            expect(result.isOk).toBe(true);
        });

        it("should update balance when settlementInfo.red > 0", async () => {
            //Arrange
            const bet = {
                uid: "user1",
                up: 1000,
                down: 0,
                seven: 0,
                totalAmount: 1000,
            };
            const betResult = {
                totalWin: "2000.0000",
                totalBetAmount: 1000,
                netWin: "1000.0000",
            };
            endGame.mockResolvedValue({ isOk: true });
            consumer.formatEndGameInfo.mockReturnValue({
                gameInfo: { gameId: "test" },
                settlementInfo: { red: 1000 },
            });

            //Act
            await consumer.callEndGame(bet, 1, new Date(), betResult);

            //Assert
            expect(callAndForget).toHaveBeenCalled();
            expect(gameManagementApiClient.users.updateBalance).toHaveBeenCalledWith({
                id: bet.uid,
                deductionAmount: -1000,
            });
        });

        it("should publish API error when endGame fails", async () => {
            //Arrange
            const bet = {
                uid: "user1",
                up: 1000,
                down: 0,
                seven: 0,
                totalAmount: 1000,
            };
            const betResult = {
                totalWin: "2000.0000",
                totalBetAmount: 1000,
                netWin: "1000.0000",
            };
            const errorResponse = { message: "API Error" };
            endGame.mockResolvedValue({ isOk: false, response: errorResponse });
            consumer.formatEndGameInfo.mockReturnValue({
                gameInfo: { gameId: "test" },
                settlementInfo: { red: 0 },
            });

            //Act
            await consumer.callEndGame(bet, 1, new Date(), betResult);

            //Assert
            expect(userBetResultPublisher.publishApiError).toHaveBeenCalledWith(bet.uid, errorResponse);
        });
    });
});
