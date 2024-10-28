import Chance from "chance";
import gameSettings from "../game-settings";
import { random } from "./dice-random";

const settlementRuleEntries = Object.entries({
    up: (totalPoints) => totalPoints > 7,
    down: (totalPoints) => totalPoints < 7,
    seven: (totalPoints) => totalPoints === 7,
});

const choiceMapping = {
    up: "8-12",
    down: "2-6",
    seven: "7",
};

export const getSettlementResult = (roundResult) => {
    const totalPoints = roundResult.dice1 + roundResult.dice2;

    return settlementRuleEntries.reduce((result, [choice, rule]) => {
        result[choice] = rule(totalPoints);

        return result;
    }, {});
};

export const generateResult = (mode, multiplierConfigs) => {
    const selectedMode = mode >= 1 && mode <= 3 ? mode : 1;
    const dice1 = random(selectedMode);
    const dice2 = random(selectedMode);

    let multiplier;
    
    if (multiplierConfigs && multiplierConfigs.values.length > 0) {
        const chance = new Chance();

        const multiplierValues = multiplierConfigs.values.filter((x) => x.ratio > 0);

        const pickedMultiplier = chance.weighted(
            multiplierValues.map((x) => x.number),
            multiplierValues.map((x) => x.ratio)
        );

        if (pickedMultiplier > 1) {
            multiplier = {
                value: pickedMultiplier,
                choice: chance.weighted(
                    gameSettings.choices,
                    gameSettings.choices.map((x) => gameSettings.multiplierChoiceRatios[x])
                ),
            };
        }
    }

    return { dice1, dice2, multiplier };
};

export const generateRawResultForHash = (roundResult) => {
    const { multiplier, dice1, dice2 } = roundResult;
    if (multiplier) {
        return `{${+dice1},${+dice2}}{${multiplier.value}x:${choiceMapping[multiplier.choice]}}`;
    }

    return `{${+dice1},${+dice2}}`;
};
