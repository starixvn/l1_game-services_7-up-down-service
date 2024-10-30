import { generateResult, getSettlementResult } from "../../src/helpers/result-helper";

describe("result statistic: 100,000 times", () => {
    const total = 1_000_000;
    const multiplierConfigs = {
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
    };
    for (let randomMode = 1; randomMode <= 3; randomMode++) {
        it(`should generate results statistically correct with mode ${randomMode}`, () => {
            //Arrange
            const statisticResult = {
                up: 0,
                down: 0,
                seven: 0,
            };

            const multiplierStatistics = {
                number: {},
                choice: {
                    up: 0,
                    down: 0,
                    seven: 0,
                },
                totalRounds: 0,
            };

            //Act
            for (let i = 0; i < total; i++) {
                const result = generateResult(randomMode, multiplierConfigs);
                if (result.multiplier) {
                    const { multiplier } = result;
                    multiplierStatistics.number[multiplier.value] = (multiplierStatistics.number[multiplier.value] ?? 0) + 1;
                    multiplierStatistics.choice[multiplier.choice]++;
                    multiplierStatistics.totalRounds++;
                }

                const settlementResult = getSettlementResult(result);
                statisticResult.up += +settlementResult.up;
                statisticResult.down += +settlementResult.down;
                statisticResult.seven += +settlementResult.seven;
            }

            //Assert
            const multiplierPercentage = {
                number: Object.keys(multiplierStatistics.number).reduce((percentage, key) => {
                    percentage[key] = (multiplierStatistics.number[key] * 100) / total;

                    return percentage;
                }, {}),
                choice: Object.keys(multiplierStatistics.choice).reduce((percentage, key) => {
                    percentage[key] = (multiplierStatistics.choice[key] * 100) / multiplierStatistics.totalRounds;

                    return percentage;
                }, {}),
                roundPercentage: (multiplierStatistics.totalRounds * 100) / total,
            };
            const resultPercentage = Object.keys(statisticResult).reduce((percentage, key) => {
                percentage[key] = (statisticResult[key] * 100) / total;

                return percentage;
            }, {});

            console.log(
                `Mode:${randomMode}, countResult: ${JSON.stringify(statisticResult)}, percentageResult: ${JSON.stringify(
                    resultPercentage
                )}, multiplier: ${JSON.stringify(multiplierStatistics)}, multiplier percentage: ${JSON.stringify(multiplierPercentage)}`
            );
            expect(resultPercentage.up).toBeGreaterThanOrEqual(41);
            expect(resultPercentage.down).toBeGreaterThanOrEqual(41);
            expect(resultPercentage.seven).toBeLessThanOrEqual(18);
        });
    }
});
