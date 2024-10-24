import { stub, stubMongoose } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { Core } from "sc-game-base";
import { SettleGameRoundConsumer } from "../../../src/consumers";
import gameSettings from "../../../src/game-settings";
import { getSettlementResult } from "../../../src/helpers/result-helper";

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

const gameManagementApiClientFactory = {
    instance: jest.fn(),
};

describe("SettleGameRoundConsumer", () => {
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
    });

    afterEach(() => {
        gameData.gameConfigs = { ...gameConfigs };
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

        afterEach(() => {
            gameData.result = null;
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
            });
        });

        describe("when totalwin > maxwin", () => {
            it("betResult.totalwin should bet set to maxwin", () => {
                //Act
                const betResult = consumer.calculateBetResult(settlementResult, bet, { ...gameConfigs.odds, up: 5 });

                //Assert
                expect(betResult.totalWin).toEqual(bet.maxWin);
            });
        });
    });
});
