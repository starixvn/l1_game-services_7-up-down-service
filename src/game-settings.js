export default {
    id: 10,
    name: "7Up7Down",
    durations: {
        wholeRound: 29,
        placingBets: 20,
        lockingBet: 3,
        shakeThePlateDuration: 3,
    },
    choices: ["up", "down", "seven"],
    choicesMapper: { up: 1, down: 2, seven: 3 },
    defaultBetTracks: {},
    hedgeBetGroups: [["up", "down"]],
    multiplierChoiceRatios: {
        up: 28,
        down: 28,
        seven: 44,
    },
};
