import { Core } from "sc-game-base";
import InGameConsumer from "../../../src/consumers/in-game-consumer";
import gameSettings from "../../../src/game-settings";
import BaseEventPublisher from "sc-game-base/src/core/event-publishers/base-event-publisher";
jest.mock("sc-game-base/src/core/event-publishers/base-event-publisher");
describe("InGameConsumer", () => {
    const gameManagementApiClientFactory = {
        instance: jest.fn(),
    };
    const getBalance = jest.fn().mockResolvedValueOnce(1000);
    let inGameConsumer;
    const gameData = new Core.GameData(gameSettings.durations.wholeRound);
    gameData.result = {
        dice1: 1,
        dice2: 2,
        multiplier: {
            value: 3,
            choice: "up",
        },
    };
    gameData.gameConfigs = {
        oddsMultipliers: {
            values: [
                {
                    number: 2,
                    ratio: 44,
                },
                {
                    number: 3,
                    ratio: 4,
                },
                {
                    number: 4,
                    ratio: 8,
                },
                {
                    number: 5,
                    ratio: 4,
                },
                {
                    number: 1,
                    ratio: 40,
                },
            ],
        },
        applyMultiplier: true,
        maxWinPerRound: 2000,
        enabled: true,
    };
    const definition = new Core.GameDefinition(gameSettings);
    const realPlayer = {
        socketClient: {
            emit: jest.fn(),
        },
    };
    const publisher = new BaseEventPublisher();
    beforeEach(() => {    
        inGameConsumer = new InGameConsumer(definition, gameData, null, publisher, null, gameManagementApiClientFactory);
        jest.spyOn(Core.BaseEventConsumers.InGameConsumer.prototype, "buildPayload").mockResolvedValueOnce({ gameConfigs: {} });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("buildPayload", () => {
        describe("when gameconfigs.oddMultipliers has value", () => {
            it("should return multipliers", async () => {
                //Act
                const payload = await inGameConsumer.buildPayload(realPlayer);

                //Assert
                expect(payload.gameConfigs.multipliers).toEqual([2, 3, 4, 5]);
            });
        });

        describe("During lock bet time", () => {
            it("should return multiplier", async () => {
                //Assert
                gameData.remainingTime = 1;

                //Act
                const payload = await inGameConsumer.buildPayload(realPlayer);

                //Assert
                expect(payload.multiplier).toEqual(gameData.result.multiplier);
            });
        });
    });

    describe("consume test", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should publish to user game configs", async () => {
            inGameConsumer.buildPayload = jest.fn(() => ({}));
            await inGameConsumer.consume(realPlayer);

            expect(publisher.publishToUser).toHaveBeenCalled();
        });
    });
});
