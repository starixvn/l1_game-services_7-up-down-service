import { GameData, GameDefinition } from "sc-game-base/src/core";
import RoundResultConsumer from "../../../src/consumers/round-result-consumer";
import gameSettings from "../../../src/game-settings";
import { generateSHA256Result } from "../../../src/helpers";

jest.mock("../../../src/helpers");

describe("RoundResultConsumer", () => {
    let consumer;
    const definition = new GameDefinition(gameSettings, jest.fn(), jest.fn(), jest.fn());

    let gameData = new GameData();
    gameData.gameConfigs = {
        randomMode: 1,
        oddsMultipliers: { values: [] },
    };

    gameData.roundId = 11;
    gameData.settlementResultFromAdmin = {
        roundId: 11,
        result: { dice1: 1, dice2: 2 },
    };
    beforeEach(() => {
        consumer = new RoundResultConsumer(gameData, definition);
    });

    describe("generateResult", () => {
        it("should return admin result when roundIds match", () => {
            const result = consumer.generateResult();

            expect(result).toBe(gameData.settlementResultFromAdmin.result);
            expect(definition.generateResult).not.toHaveBeenCalled();
        });

        it("should generate result when roundIds don't match", () => {
            gameData.settlementResultFromAdmin.roundId = 12;
            definition.generateResult.mockReturnValueOnce({ dice1: 3, dice2: 4 });

            const result = consumer.generateResult();

            expect(result).toEqual({ dice1: 3, dice2: 4 });
            expect(definition.generateResult).toHaveBeenCalledWith(gameData.gameConfigs.randomMode, gameData.gameConfigs.oddsMultipliers);
        });
    });

    describe("buildResultHash", () => {
        it("should build result hash correctly", () => {
            const mockRawResult = "raw-result";
            const mockHashResult = { hash: "hash123", salt: "salt123" };

            definition.generateRawResultForHash.mockReturnValue(mockRawResult);
            generateSHA256Result.mockReturnValue(mockHashResult);

            const result = consumer.buildResultHash();

            expect(definition.generateRawResultForHash).toHaveBeenCalledWith(gameData.result);
            expect(generateSHA256Result).toHaveBeenCalledWith(mockRawResult, gameData.roundId);
            expect(result).toEqual({
                ...mockHashResult,
                roundId: gameData.roundId,
            });
        });
    });
});
