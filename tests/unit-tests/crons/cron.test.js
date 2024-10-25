import { stub } from "jest-micro-auto-stub";
import { Core } from "sc-game-base";
import { RunningRoundInfoPublisher } from "sc-game-base/src/core/event-publishers";
import GameCron from "../../../src/crons/game-cron";
import gameSettings from "../../../src/game-settings";

const definition = new Core.GameDefinition(gameSettings);
const gameData = new Core.GameData(gameSettings.durations.wholeRound);
const gameManagementApiClientFactory = { instance: jest.fn() };
const runningRoundInfoPublisher = stub(RunningRoundInfoPublisher);
let cron;
beforeEach(() => {
    cron = new GameCron({ definition, gameData, gameManagementApiClientFactory, runningRoundInfoPublisher });
});

describe("publishMultiplierResult", () => {
    describe("when result has multiplier", () => {
        it("should publish multiplier to clients", () => {
            //Arrange
            gameData.result = {
                dice1: 1,
                dice2: 2,
                multiplier: {
                    value: 4,
                    choice: "up",
                },
            };

            //Act
            cron.publishMultiplierResult();

            //Assert
            expect(runningRoundInfoPublisher.publishToAllUsers).toHaveBeenCalledWith({ multiplier: gameData.result.multiplier });
        });
    });

    describe("when result doesnt have multiplier", () => {
        it("shouldn't publish multiplier to clients", () => {
            //Arrange
            gameData.result = {
                dice1: 1,
                dice2: 2,
            };

            //Act
            cron.publishMultiplierResult();

            //Assert
            expect(runningRoundInfoPublisher.publishToAllUsers).not.toHaveBeenCalled();
        });
    });
});

afterEach(() => {
    gameData.remainingTime = gameSettings.durations.wholeRound;
    jest.clearAllMocks();
});
