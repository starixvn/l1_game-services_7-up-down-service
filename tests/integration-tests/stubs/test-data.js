const game = {
    id: 103,
    name: "7Up7Down",
};

const currencyData = { code: "USD", name: "$US" };

const socketOptions = {
    socketUri: `http://localhost:5002/user/7Up7Down`,
    gameName: game.name,
    proxyRoute: "/socket.io",
};

const gameConfig = {
    type: 1,
    name: "7up7down",
    displayName: "7 Up 7 Down",
    enabled: true,
    botenabled: false,
    minBet: 1,
    maxBet: 2000,
    disabledround: null,
    bot_maxbet: 10,
    hour_maxbot: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    disabled_message: "Game đang được bảo trì, vui lòng quay lại sau 10 phút.",
    choices_maxbet: { player: 2000, banker: 2000, playerPair: 500, bankerPair: 500, tie: 500 },
    maxBetPerChoices: { player: 2000, banker: 2000, playerPair: 500, bankerPair: 500, tie: 500 },
    odds: { player: 2, banker: 1.95, playerPair: 12, bankerPair: 12, tie: 9 },
    delayStartTime: 0,
    enableFreeBet: false,
    slotsConfig: null,
    siteExclusions: [],
    smartBotEnabled: false,
    smartBotGroupRatio: 0,
    gameId: 81,
    randomMode: 1,
    margin: null,
    maxWinPerRound: 200,
    oddsMultipliers: {
        extraFeeRatio: 0.2,
        numberOfCardsRange: { min: 2, max: 6 },
        values: [
            { number: 2, ratio: 6 },
            { number: 3, ratio: 4 },
            { number: 4, ratio: 2 },
        ],
    },
    applyMultiplier: true,
};
const rounds = [];

const userBetData = (uid) => {
    return [];
};

export { currencyData, game, gameConfig, rounds, socketOptions, userBetData };

