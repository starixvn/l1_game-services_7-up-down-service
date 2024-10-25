const game = {
    id: 103,
    name: "SevenUpDown",
};

const currencyData = { code: "USD", name: "$US" };

const socketOptions = {
    socketUri: `http://localhost:5002/user/sevenupdown`,
    gameName: game.name,
    proxyRoute: "/socket.io",
};

const gameConfig = {
    type: 1,
    name: "sevenupdown",
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
    maxBetPerChoices: { up: 2000, down: 2000, seven: 2000 },
    odds: { up: 2, down: 2, seven: 5 },
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
        values: [
            { number: 2, ratio: 6 },
            { number: 3, ratio: 4 },
            { number: 4, ratio: 2 },
        ],
    },
    applyMultiplier: true,
};
const rounds = [
    {
        time: "2024-10-17T10:00:31.006Z",
        id: 1,
        result: {
            dice1: 5,
            dice2: 2,
            multiplier: {
                value: 2,
                choice: "down",
            },
        },
        settlementResult: {
            up: false,
            down: false,
            seven: true,
        },
        exchangeRateId: 1,
    },
];

const userBetData = (uid) => {
    return [];
};

export { currencyData, game, gameConfig, rounds, socketOptions, userBetData };

