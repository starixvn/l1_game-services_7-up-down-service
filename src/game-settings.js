export default {
    id: 103,
    name: "SevenUpDown",
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
        up: 38,
        down: 38,
        seven: 24,
    },
};
