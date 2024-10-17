import Chance from "chance";
import gameSettings from "../game-settings";
import { random } from "./dice-random";

const settlementRuleEntries = Object.entries({
    up: (totalPoints) => totalPoints > 7,
    down: (totalPoints) => totalPoints < 7,
    seven: (totalPoints) => totalPoints === 7,
});

export const getSettlementResult = (roundResult) => {
    const totalPoints = roundResult.dice1 + roundResult.dice2;

    return settlementRuleEntries.reduce((result, [choice, rule]) => {
        result[choice] = rule(totalPoints);

        return result;
    }, {});
};

export const generateResult = (mode, multiplierConfig) => {
    const selectedMode = mode >= 1 && mode <= 3 ? mode : 1;
    const dice1 = random(selectedMode);
    const dice2 = random(selectedMode);

    let multiplierValue, multiplierChoice;
    const chance = new Chance();

    if (chance.bool({ likelihood: gameSettings.roundHasMultiplierProbability })) {
        console.log(multiplierConfig);
        const multiplierValues = multiplierConfig.values.filter((x) => x.ratio > 0);

        multiplierValue = chance.weighted(
            multiplierValues.map((x) => x.number),
            multiplierValues.map((x) => x.ratio)
        );

        multiplierChoice = chance.weighted(
            gameSettings.choices,
            gameSettings.choices.map((x) => gameSettings.multiplierChoiceRatios[x])
        );
    }

    return { dice1, dice2, multiplierValue, multiplierChoice };
};

export const generateRawResultForHash = (roundResult) => {
    return `{${+roundResult.dice1},${+roundResult.dice2},${roundResult.multiplierChoice},${roundResult.multiplierValue}x}`;
};
