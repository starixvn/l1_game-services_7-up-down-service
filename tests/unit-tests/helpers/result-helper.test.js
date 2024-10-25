import { generateRawResultForHash, generateResult, getSettlementResult } from "../../../src/helpers/result-helper";

describe("generateRawResultForHash", () => {
    describe("when result doesnt have multiplier", () => {
        it("the raw string doesnt contain multiplier", () => {
            //Arrange
            const result = {
                dice1: 2,
                dice2: 3,
            };

            //Act
            const rawString = generateRawResultForHash(result);
            //Assert
            expect(rawString).toEqual("{2,3}");
        });
    });

    describe("when result has multiplier", () => {
        it("the raw string should contain multiplier", () => {
            //Arrange
            const result = {
                dice1: 2,
                dice2: 3,
                multiplier: {
                    value: 4,
                    choice: "up",
                },
            };

            //Act
            const rawString = generateRawResultForHash(result);
            //Assert
            expect(rawString).toEqual("{2,3}{4x:8-12}");
        });
    });
});

describe("generateResult", () => {
    describe("when multiplierConfigs is null/undefined", () => {
        it("the result shouldnt have multiplier", () => {
            //Act
            const result = generateResult(1);
            //Assert
            expect(result.multiplier).toBeUndefined();
        });
    });

    describe("when multiplierConfigs has value", () => {
        it("the result should have multiplier", () => {
            //Act
            const result = generateResult(1, {
                values: [
                    { number: 2, ratio: 40 },
                    { number: 3, ratio: 4 },
                ],
            });
            //Assert
            expect(result.multiplier).not.toBeUndefined();
        });
    });
});

describe("getSettlementResult", () => {
    it("should return result correctly", () => {
        //Act
        const settlementResult = getSettlementResult({ dice1: 1, dice2: 1 });
        //Assert
        expect(settlementResult).toEqual({ up: false, down: true, seven: false });
    });
});
