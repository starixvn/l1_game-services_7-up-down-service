import { stub } from "jest-micro-auto-stub";
import { Core } from "sc-game-base";
import { PlaceBetConsumer } from "../../../src/consumers";
import gameSettings from "../../../src/game-settings";

const publisher = stub(Core.BaseEventPublishers.BaseEventPublisher);
const definition = new Core.GameDefinition(gameSettings);
const gameData = new Core.GameData();

const gameConfigs = {
    enabled: true,
    enableFreeBet: true,
    odds: {
        up: 2,
        down: 2,
        seven: 5,
    },
};
gameData.gameConfigs = { ...gameConfigs };
gameData.roundId = 1;
gameData.remainingTime = 30;
gameData.ingame = {};

const currencyGroupGames = [
    {
        groupId: "1",
        minBet: 10,
        maxBet: 1000,
        maxBetPerChoices: {
            up: 500,
            down: 500,
            seven: 500,
        },
    },
];

gameData.currencyGroupGames = currencyGroupGames;

const mockPlayer = {
    UID: "player1",
    profile: {
        name: "player1",
        minBet: 10,
        maxBet: 1000,
    },
    session: {
        currencyName: "USD",
        system: "system1",
        operatorId: "operator1",
        currencyGroupId: "1",
    },
};

describe("PlaceBetConsumer", () => {
    /**
     * @type {PlaceBetConsumer}
     */
    let consumer;

    beforeEach(() => {
        consumer = new PlaceBetConsumer(definition, gameData, publisher);
        jest.spyOn(consumer, "validateBetRequest").mockReturnValue(true);
        jest.spyOn(consumer, "adjustBetTracks").mockImplementation(() => {});
        gameData.ingame = {};
    });

    afterEach(() => {
        jest.clearAllMocks();
        gameData.gameConfigs = { ...gameConfigs };
        gameData.roundId = 1;
        gameData.remainingTime = 30;
        gameData.ingame = {};
    });

    describe("consume", () => {
        it("should assign default values to payload", () => {
            //Arrange
            const payload = {
                amount: "100",
                betChoice: "up",
            };

            //Act
            consumer.consume(mockPlayer, payload);

            //Assert
            expect(payload.amount).toBe(100);
            expect(payload.freeBet).toBe(false);
            expect(payload.roundId).toBe(gameData.roundId);
            expect(payload.mode).toBe(consumer.DisplayMode.Landscape);
            expect(payload.receivedTime).toBeInstanceOf(Date);
        });

        it("should use provided payload values when available", () => {
            //Arrange
            const payload = {
                amount: "200",
                betChoice: "down",
                freeBet: true,
                roundId: 2,
                m: consumer.DisplayMode.Portrait,
            };

            //Act
            consumer.consume(mockPlayer, payload);

            //Assert
            expect(payload.amount).toBe(200);
            expect(payload.freeBet).toBe(true);
            expect(payload.roundId).toBe(2);
            expect(payload.mode).toBe(consumer.DisplayMode.Portrait);
        });

        it("should return early if validation fails", () => {
            //Arrange
            consumer.validateBetRequest.mockReturnValue(false);
            const payload = {
                amount: "100",
                betChoice: "up",
            };

            //Act
            consumer.consume(mockPlayer, payload);

            //Assert
            expect(consumer.validateBetRequest).toHaveBeenCalledWith(
                mockPlayer,
                "up",
                100,
                false,
                gameData.roundId
            );
            expect(consumer.adjustBetTracks).not.toHaveBeenCalled();
            expect(gameData.ingame[mockPlayer.profile.name]).toBeUndefined();
        });

        it("should create new player entry if player not in game", () => {
            //Arrange
            const payload = {
                amount: "100",
                betChoice: "up",
            };

            //Act
            consumer.consume(mockPlayer, payload);

            //Assert
            expect(gameData.ingame[mockPlayer.profile.name]).toBeDefined();
            expect(gameData.ingame[mockPlayer.profile.name].name).toBe(mockPlayer.profile.name);
            expect(gameData.ingame[mockPlayer.profile.name].currency).toBe(mockPlayer.session.currencyName);
            expect(gameData.ingame[mockPlayer.profile.name].system).toBe(mockPlayer.session.system);
            expect(gameData.ingame[mockPlayer.profile.name].operatorId).toBe(mockPlayer.session.operatorId);
            expect(gameData.ingame[mockPlayer.profile.name].betTracks).toEqual({});
            expect(gameData.ingame[mockPlayer.profile.name].betQueue).toHaveLength(1);
            expect(gameData.ingame[mockPlayer.profile.name].betQueue[0]).toEqual({
                player: mockPlayer,
                payload: payload,
            });
        });

        it("should not create new player entry if player already in game", () => {
            //Arrange
            const existingPlayer = {
                name: mockPlayer.profile.name,
                currency: "EUR",
                system: "system2",
                betTracks: { up: 50 },
                betQueue: [{ player: mockPlayer, payload: {} }],
                operatorId: "operator2",
            };
            gameData.ingame[mockPlayer.profile.name] = existingPlayer;
            const payload = {
                amount: "100",
                betChoice: "up",
            };

            //Act
            consumer.consume(mockPlayer, payload);

            //Assert
            expect(gameData.ingame[mockPlayer.profile.name]).toBe(existingPlayer);
            expect(gameData.ingame[mockPlayer.profile.name].currency).toBe("EUR");
        });

        it("should call adjustBetTracks with correct parameters", () => {
            //Arrange
            const payload = {
                amount: "100",
                betChoice: "up",
            };

            //Act
            consumer.consume(mockPlayer, payload);

            //Assert
            expect(consumer.adjustBetTracks).toHaveBeenCalledWith(mockPlayer.profile.name, payload);
        });

        it("should push bet to player's betQueue", () => {
            //Arrange
            const payload = {
                amount: "100",
                betChoice: "up",
            };

            //Act
            consumer.consume(mockPlayer, payload);

            //Assert
            expect(gameData.ingame[mockPlayer.profile.name].betQueue).toHaveLength(1);
            expect(gameData.ingame[mockPlayer.profile.name].betQueue[0]).toEqual({
                player: mockPlayer,
                payload: payload,
            });
        });

        it("should handle multiple bets for same player", () => {
            //Arrange
            const payload1 = {
                amount: "100",
                betChoice: "up",
            };
            const payload2 = {
                amount: "200",
                betChoice: "down",
            };

            //Act
            consumer.consume(mockPlayer, payload1);
            consumer.consume(mockPlayer, payload2);

            //Assert
            expect(gameData.ingame[mockPlayer.profile.name].betQueue).toHaveLength(2);
            expect(gameData.ingame[mockPlayer.profile.name].betQueue[0].payload).toBe(payload1);
            expect(gameData.ingame[mockPlayer.profile.name].betQueue[1].payload).toBe(payload2);
        });

        it("should handle freeBet flag correctly", () => {
            //Arrange
            const payload = {
                amount: "100",
                betChoice: "up",
                freeBet: true,
            };

            //Act
            consumer.consume(mockPlayer, payload);

            //Assert
            expect(payload.freeBet).toBe(true);
            expect(consumer.validateBetRequest).toHaveBeenCalledWith(
                mockPlayer,
                "up",
                100,
                true,
                gameData.roundId
            );
        });

        it("should handle undefined freeBet as false", () => {
            //Arrange
            const payload = {
                amount: "100",
                betChoice: "up",
            };

            //Act
            consumer.consume(mockPlayer, payload);

            //Assert
            expect(payload.freeBet).toBe(false);
        });

        it("should use gameData.roundId when roundId not provided", () => {
            //Arrange
            gameData.roundId = 5;
            const payload = {
                amount: "100",
                betChoice: "up",
            };

            //Act
            consumer.consume(mockPlayer, payload);

            //Assert
            expect(payload.roundId).toBe(5);
            expect(consumer.validateBetRequest).toHaveBeenCalledWith(mockPlayer, "up", 100, false, 5);
        });
    });
});

