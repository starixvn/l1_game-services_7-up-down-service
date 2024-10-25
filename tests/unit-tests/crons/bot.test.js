import { Core } from "sc-game-base";
import Bot from "../../../src/crons/bot";
import gameSettings from "../../../src/game-settings";

let bot;
const definition = new Core.GameDefinition(gameSettings);
const gameData = new Core.GameData(gameSettings.durations.wholeRound);
gameData.gameConfigs = {
    choices_maxbet: {
        up: 2000,
        down: 2000,
        seven: 2000,
    },
    minbet: 1,
    bot_maxbet: 2000,
};
const gameManagementApiClientFactory = { instance: jest.fn() };

beforeEach(() => {
    bot = new Bot(definition, gameData, gameManagementApiClientFactory);
});

describe("placebet", () => {
    describe("During lock bet time", () => {
        it("should ignore bot bet", async () => {
            //Arrange
            gameData.remainingTime = gameSettings.durations.lockingBet - 1;

            //Act
            await bot.placeBet({});

            //Act
            expect(bot.totalTickets).toEqual(0);
        });
    });
    describe("During place bet time", () => {
        it("should let bot bet", async () => {
            //Arrange
            gameData.remainingTime = gameSettings.durations.placingBets - 1;

            //Act
            await bot.placeBet({});

            //Act
            expect(bot.totalTickets).toEqual(1);
        });
    });
});

describe("resetAllBotData", () => {
    it("should call resetAllBets", () => {
        // Arrange
        const spy = jest.spyOn(bot, "resetAllBets");

        // Act
        bot.resetAllBotData();

        // Assert
        expect(spy).toHaveBeenCalled();
    });
});

afterEach(() => {
    gameData.remainingTime = gameSettings.durations.wholeRound;
    jest.clearAllMocks();
});
